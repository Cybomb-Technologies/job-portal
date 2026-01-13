const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments();
        const totalJobSeekers = await User.countDocuments({ role: 'Job Seeker' });
        const totalEmployers = await User.countDocuments({ role: 'Employer' });
        const totalVerifiedEmployers = await User.countDocuments({ 
            role: 'Employer', 
            'employerVerification.status': 'Verified' 
        });
        const totalCompanies = await User.distinct('companyName', { role: 'Employer' });

        res.json({
            totalJobs,
            totalJobSeekers,
            totalEmployers,
            totalVerifiedEmployers,
            totalCompanies: totalCompanies.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all job seekers
// @route   GET /api/admin/job-seekers
// @access  Private/Admin
const getJobSeekers = async (req, res) => {
    try {
        const seekers = await User.find({ role: 'Job Seeker' }).select('-password');
        res.json(seekers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all employers
// @route   GET /api/admin/employers
// @access  Private/Admin
const getEmployers = async (req, res) => {
    try {
        const employers = await User.find({ role: 'Employer' }).select('-password');
        res.json(employers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all registered companies
// @route   GET /api/admin/companies
// @access  Private/Admin
const getCompanies = async (req, res) => {
    try {
        // Companies are derived from employers
        const companies = await User.find({ 
            role: 'Employer', 
            companyName: { $exists: true, $ne: '' } 
        }).select('companyName website companyEmail companyLocation companyCategory companyType employeeCount foundedYear employerVerification profilePicture');
        
        // Group by company name to avoid duplicates if multiple employers share a company name
        const uniqueCompanies = [];
        const seenCompanies = new Set();
        
        companies.forEach(company => {
            if (!seenCompanies.has(company.companyName)) {
                seenCompanies.add(company.companyName);
                uniqueCompanies.push(company);
            }
        });

        res.json(uniqueCompanies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user active status (Block/Unblock)
// @route   PUT /api/admin/user/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'Admin') {
            return res.status(403).json({ message: 'Cannot block/unblock other admins' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ 
            message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`,
            isActive: user.isActive 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getJobSeekers,
    getEmployers,
    getCompanies,
    toggleUserStatus
};
