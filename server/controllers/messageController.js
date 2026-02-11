const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, relatedJob } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            relatedJob
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
            ],
            deletedBy: { $ne: myId }
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
            $or: [{ sender: myId }, { receiver: myId }],
            deletedBy: { $ne: myId }
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

// Delete conversation (hide for user)
const deleteConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            {
                $or: [
                    { sender: myId, receiver: userId },
                    { sender: userId, receiver: myId }
                ]
            },
            { $addToSet: { deletedBy: myId } }
        );

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Server error deleting conversation' });
    }
};
// Get conversations of a team member (Admin only)
const getTeamMemberConversations = async (req, res) => {
    try {
        const { memberId } = req.params;
        const myId = req.user._id;

        // Verify requester is an employer and admin
        if (req.user.role !== 'Employer' || req.user.companyRole !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only Company Admins can view team chats.' });
        }

        // Verify member belongs to same company
        console.log("Checking member:", memberId);
        const member = await User.findById(memberId);
        if (!member) {
             return res.status(404).json({ message: 'Team member not found' });
        }
        
        // Ensure accurate company check (compare as strings)
        if (!member.companyId || member.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'This user is not in your company' });
        }

        // Find all distinct users participated in chats with this member
        const messages = await Message.find({
            $or: [{ sender: memberId }, { receiver: memberId }],
            deletedBy: { $ne: memberId } // View as if we are the member
        }).sort({ createdAt: -1 });

        const userIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== memberId.toString()) userIds.add(msg.sender.toString());
            if (msg.receiver.toString() !== memberId.toString()) userIds.add(msg.receiver.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('name email role profilePicture companyName companyId')
            .populate('companyId', 'name profilePicture');

        const conversations = await Promise.all(users.map(async (user) => {
            const lastMsg = messages.find(m => 
                (m.sender.toString() === user._id.toString() || m.receiver.toString() === user._id.toString())
            );
            
            // Count unread messages (from member's perspective)
            const unreadCount = await Message.countDocuments({
                sender: user._id,
                receiver: memberId,
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
        console.error('Error fetching team member conversations:', error);
        res.status(500).json({ message: 'Server error fetching team conversations' });
    }
};

// Get messages for a team member (Admin only)
const getTeamMemberMessages = async (req, res) => {
    try {
        const { memberId, otherUserId } = req.params;
        const myId = req.user._id;

        // Verify requester is an employer and admin
        if (req.user.role !== 'Employer' || req.user.companyRole !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only Company Admins can view team chats.' });
        }

        // Verify member belongs to same company
        const member = await User.findById(memberId);
        if (!member || !member.companyId || member.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Access denied to this user\'s chats' });
        }

        const messages = await Message.find({
            $or: [
                { sender: memberId, receiver: otherUserId },
                { sender: otherUserId, receiver: memberId }
            ],
            deletedBy: { $ne: memberId }
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching team member messages:', error);
        res.status(500).json({ message: 'Server error fetching team messages' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    markMessagesAsRead,
    deleteConversation,
    getTeamMemberConversations,
    getTeamMemberMessages
};
