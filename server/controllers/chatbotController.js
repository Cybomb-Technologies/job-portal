const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');

// Lazy init inside handler
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (req, res) => {
  try {
    const { message, history } = req.body;
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

    // 2. Call Gemini
    // Initialize inside request to ensure env vars are loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Construct chat history for Gemini
    // History format from frontend might need adaptation. 
    // Gemini expects [{ role: "user" | "model", parts: [{ text: "..." }] }]
    // Assuming frontend sends simple objects, we map them here.
    let chatHistory = history?.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    })) || [];

    // Gemini requires history to start with a 'user' role
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory.shift();
    }

    const chat = model.startChat({
      history: chatHistory,
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

    // 3. Update Usage
    user.chatUsage.count += 1;
    user.chatUsage.date = new Date(); // Update date to now to keep it fresh
    await user.save();

    res.json({ 
      response: responseText, 
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

module.exports = { chatWithGemini, getChatUsage };
