const Contact = require('../models/Contact');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // Notify Admins
        const admins = await User.find({ role: 'Admin' });
        
        // 1. Create DB Notifications for Admins
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            sender: null, // Public inquiry, no sender user ID
            type: 'CONTACT_FORM',
            message: `New Inquiry from ${name}: ${subject}`,
            relatedId: contact._id,
            relatedModel: 'Contact'
        }));
        
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Notify Admin via Socket.io
        if (req.io) {
            req.io.to('admin-room').emit('notification', {
                message: `New Inquiry from ${name}: ${subject}`,
                type: 'CONTACT_FORM',
                data: contact
            });
        }

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Your message has been sent successfully!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        contact.status = req.body.status || contact.status;
        await contact.save();

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Reply to a message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
exports.replyToMessage = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        const { replyMessage } = req.body;

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Send Email
        const emailOptions = {
            email: contact.email,
            subject: `Re: ${contact.subject} - JobPortal Support`,
            message: `Hello ${contact.name},\n\n${replyMessage}\n\nBest Regards,\nJobPortal Support Team`
        };

        try {
            await sendEmail(emailOptions);
        } catch (emailError) {
            console.error("Failed to send email reply:", emailError);
            // Continue to update status even if email fails
        }

        // Update Status
        contact.status = 'Replied';
        contact.reply = replyMessage;
        contact.repliedAt = Date.now();
        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully',
            data: contact
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply'
        });
    }
};
