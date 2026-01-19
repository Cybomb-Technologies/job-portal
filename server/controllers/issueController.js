const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new issue report
// @route   POST /api/issues
// @access  Public
const createIssue = async (req, res) => {
    try {
        const { name, email, type, description } = req.body;

        const issue = await Issue.create({
            user: req.user ? req.user._id : null,
            name,
            email,
            type,
            description
        });

        // Notify Admins
        const admins = await User.find({ role: 'Admin' });
        
        // 1. Create DB Notifications for Admins
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            sender: req.user ? req.user._id : null, // or System
            type: 'NEW_ISSUE',
            message: `New Issue Reported: ${type} - ${name}`,
            relatedId: issue._id,
            relatedModel: 'Issue'
        }));
        
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // 2. Real-time Push Notification
        if (req.io) {
            req.io.to('admin-room').emit('notification', {
                message: `New Issue Reported: ${type} - ${name}`,
                type: 'NEW_ISSUE'
            });
        }

        res.status(201).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all issues (Admin)
// @route   GET /api/issues
// @access  Private/Admin
const getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({}).sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user issues (Logged in user)
// @route   GET /api/issues/my-issues
// @access  Private
const getUserIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update issue status (Admin)
// @route   PUT /api/issues/:id/status
// @access  Private/Admin
const updateIssueStatus = async (req, res) => {
    try {
        const { status, reply } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = status;
        // Optionally save the reply in the issue itself if you add a 'reply' field to schema
        // issue.reply = reply; 
        
        await issue.save();

        // 1. Notify User via Socket & DB (if user exists)
        if (issue.user) {
            // Create DB Notification
            await Notification.create({
                recipient: issue.user,
                sender: req.user._id, // Admin ID
                type: 'ISSUE_UPDATE',
                message: `Issue Resolved: ${reply || status}`,
                relatedId: issue._id,
                relatedModel: 'Issue'
            });

            if (req.io) {
                req.io.to(issue.user.toString()).emit('notification', {
                    message: `Issue "${issue.name}" Resolved: ${reply || status}`,
                    type: 'ISSUE_UPDATE'
                });
            }
        }

        // 2. Send Email Notification
        if (status === 'Resolved' && issue.email) {
             const sendEmail = require('../utils/sendEmail');
             const message = `
                 <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4169E1;">Issue Resolved</h2>
                    <p>Dear ${issue.name},</p>
                    <p>We are pleased to inform you that the issue you reported has been resolved.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Your Issue:</strong><br> ${issue.description}</p>
                    </div>

                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Admin Reply:</strong><br>${reply || 'The issue has been fixed.'}</p>
                    </div>

                    <p>Thank you for helping us improve JobPortal.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">Best regards,<br>The JobPortal Team</p>
                 </div>
             `;
             
             try {
                 await sendEmail({
                     email: issue.email,
                     subject: 'Ticket Resolved - JobPortal',
                     html: message,
                     message: `Your issue has been resolved. Reply: ${reply}`
                 });
             } catch (emailError) {
                 console.error('Email sending failed:', emailError);
             }
        }

        res.json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createIssue,
    getIssues,
    getUserIssues,
    updateIssueStatus
};
