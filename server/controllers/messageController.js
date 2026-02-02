const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });

        await newMessage.save();

        // Get sender info for notification
        const sender = await User.findById(senderId).select('name');
        const senderName = sender?.name || 'Someone';

        // Create notification for receiver
        const notification = new Notification({
            recipient: receiverId,
            sender: senderId,
            type: 'NEW_MESSAGE',
            message: `${senderName} sent you a message`,
            relatedId: newMessage._id,
            relatedModel: 'Message'
        });
        await notification.save();

        // Socket.IO logic to emit message and notification to receiver
        const io = req.io;
        if (io) {
            io.to(receiverId).emit('receive_message', newMessage);
            // Also emit notification event
            io.to(receiverId).emit('notification', { 
                message: `${senderName} sent you a message`,
                type: 'NEW_MESSAGE'
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

// Get conversation history with a specific user
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// Get list of users the current user has chatted with
const getConversations = async (req, res) => {
    try {
        const myId = req.user._id;

        // Find all distinct users participated in chats with current user
        // This is a basic aggregation, might need optimization for large datasets
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        }).sort({ createdAt: -1 });

        const userIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== myId.toString()) userIds.add(msg.sender.toString());
            if (msg.receiver.toString() !== myId.toString()) userIds.add(msg.receiver.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('name email role profilePicture companyName companyId')
            .populate('companyId', 'name profilePicture'); // Populate company details

        const conversations = await Promise.all(users.map(async (user) => {
            const lastMsg = messages.find(m => 
                (m.sender.toString() === user._id.toString() || m.receiver.toString() === user._id.toString())
            );
            
            // Count unread messages from this user
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                receiver: myId,
                read: false
            });

            return {
                user,
                lastMessage: lastMsg,
                unreadCount
            };
        }));
        
        // Sort by last message date
        conversations.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
            return dateB - dateA;
        });

        res.json(conversations);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
};

// Mark messages as read from a specific sender
const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { sender: senderId, receiver: myId, read: false },
            { $set: { read: true } }
        );

        const io = req.io;
        if (io) {
            io.to(senderId).emit('messages_read', { readerId: myId });
        }

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error marking messages as read' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    markMessagesAsRead
};
