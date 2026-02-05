const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const AIChat = require('../models/AIChat');

// Lazy init inside handler
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    // 1. Rate Limit Check
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastUsageDate = user.chatUsage.date ? new Date(user.chatUsage.date) : null;
    if(lastUsageDate) lastUsageDate.setHours(0,0,0,0);

    if (!lastUsageDate || lastUsageDate < today) {
      // New day, reset count
      user.chatUsage = { date: new Date(), count: 0 };
    }

    if (user.chatUsage.count >= 10) {
      return res.status(429).json({ 
        message: 'Daily limit reached. Come back tomorrow!',
        remainingChats: 0
      });
    }

    // 2. Fetch or Create Chat Session
    let chatSession;
    if (chatId) {
        chatSession = await AIChat.findOne({ _id: chatId, userId });
        if (!chatSession) {
            return res.status(404).json({ message: 'Chat session not found' });
        }
    } else {
        // Create new session
        // Generate title from first few words of message
        const title = message.split(' ').slice(0, 5).join(' ') + '...';
        chatSession = new AIChat({
            userId,
            title,
            messages: []
        });
    }

    // 3. Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Construct chat history for Gemini
    // We use the messages from the DB session + the new message (handled by startChat automatically if we pass history correctly)
    // Actually, startChat expects history EXCLUDING the new message we are about to send.
    
    let geminiHistory = chatSession.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // Gemini requires history to start with a 'user' role if it's not empty? 
    // Actually it just needs to be alternating.
    // Ensure we don't start with model if that's a rule (usually it is).
    // Our DB messages should be strictly alternating ideally, but let's be safe.
    while (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
        geminiHistory.shift();
    }

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
      systemInstruction: {
          role: "system",
          parts: [{ text: "You are an expert AI Career Coach named 'JobPortal AI'. specific for the job platform 'Job Portal'. Your goal is to help users with resume tips, interview preparation, career path advice, and job search strategies. Be encouraging, professional, and concise. Do not answer questions unrelated to careers or professional development. If asked who you are, say you are the AI Career Coach for this Job Portal." }]
      }
    });

    // Helper function for retry logic
    const sendMessageWithRetry = async (msg, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await chat.sendMessage(msg);
        } catch (error) {
          if (i === retries - 1) throw error; // Throw if it's the last attempt
          
          const isOverloaded = error.status === 503 || error.message.includes('overloaded');
          if (isOverloaded) {
            console.log(`Model overloaded. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
             throw error; // Throw non-overload errors immediately
          }
        }
      }
    };

    const result = await sendMessageWithRetry(message);
    const responseText = result.response.text();

    // 4. Save Messages to DB
    chatSession.messages.push({ sender: 'user', text: message });
    chatSession.messages.push({ sender: 'ai', text: responseText });
    await chatSession.save();

    // 5. Update Usage
    user.chatUsage.count += 1;
    user.chatUsage.date = new Date(); // Update date to now to keep it fresh
    await user.save();

    res.json({ 
      response: responseText, 
      chatId: chatSession._id,
      title: chatSession.title,
      remainingChats: 10 - user.chatUsage.count 
    });

  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ message: 'AI Service currently unavailable.' });
  }
};

const getChatUsage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let count = 0;
        const lastUsageDate = user.chatUsage.date ? new Date(user.chatUsage.date) : null;
        if(lastUsageDate) lastUsageDate.setHours(0,0,0,0);

        if (lastUsageDate && lastUsageDate.getTime() === today.getTime()) {
            count = user.chatUsage.count;
        }

        res.json({ remainingChats: Math.max(0, 10 - count) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching usage' });
    }
}

const getChatHistory = async (req, res) => {
    try {
        const chats = await AIChat.find({ userId: req.user._id })
            .select('_id title createdAt')
            .sort({ createdAt: -1 });
        res.json(chats);
    } catch (error) {
        console.error("Fetch history error", error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

const getChatDetails = async (req, res) => {
    try {
        const chat = await AIChat.findOne({ _id: req.params.id, userId: req.user._id });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat);
    } catch (error) {
        console.error("Fetch chat details error", error);
        res.status(500).json({ message: 'Failed to fetch chat details' });
    }
};

module.exports = { chatWithGemini, getChatUsage, getChatHistory, getChatDetails };
