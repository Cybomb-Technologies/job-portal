const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// Helper function to create a log entry
const logActivity = async (user, action, details, targetId = null, targetModel = null) => {
    try {
        if (!user || !user.companyId) return;

        await ActivityLog.create({
            companyId: user.companyId,
            performerId: user._id,
            performerName: user.name,
            performerEmail: user.email,
            action,
            details,
            targetId,
            targetModel
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Controller to get logs for a company
const getLogs = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only Admin can view logs
        if (user.companyRole !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can view activity logs.' });
        }

        const logs = await ActivityLog.find({ companyId: user.companyId })
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 logs for now

        res.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLogs,
    logActivity
};
