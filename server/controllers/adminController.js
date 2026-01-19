const User = require('../models/User');
const Job = require('../models/Job');
const sendEmail = require('../utils/sendEmail');

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



// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private/Admin
const getPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.find({
            role: 'Employer',
            'employerVerification.documents': { 
                $elemMatch: { status: 'Pending' } 
            }
        }).select('name email companyName employerVerification');

        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update document verification status
// @route   PUT /api/admin/verification/:userId/document/:documentId
// @access  Private/Admin
const updateVerificationStatus = async (req, res) => {
    try {
        const { userId, documentId } = req.params;
        const { status, rejectionReason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const document = user.employerVerification.documents.id(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.status = status;
        if (status === 'Rejected' && rejectionReason) {
            document.rejectionReason = rejectionReason;
        }

        // Check overall verification status
        const allDocuments = user.employerVerification.documents;
        const allApproved = allDocuments.every(doc => doc.status === 'Approved');
        const anyRejected = allDocuments.some(doc => doc.status === 'Rejected');

        if (allApproved && allDocuments.length > 0) {
            user.employerVerification.status = 'Verified';
            user.employerVerification.level = 2; // Legal Verified
            
            // Create notification for employer
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: user._id,
                sender: req.user._id, // Admin
                type: 'SYSTEM',
                message: 'Your company verification documents have been approved. You are now a verified employer.',
                relatedId: user._id,
                relatedModel: 'User'
            });

            // Send Email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Company Verification Approved - Job Portal',
                    message: `Congratulations! Your documents have been approved. Your company ${user.companyName || ''} is now Level 2 Verified.`,
                    html: `
                        <h3>Congratulations!</h3>
                        <p>Your documents have been approved.</p>
                        <p>Your company <strong>${user.companyName || ''}</strong> is now <strong>Level 2 Verified</strong>.</p>
                        <p>You now have access to verified employer features.</p>
                    `
                });
            } catch (err) {
                console.error("Email send failed", err);
            }

        } else if (anyRejected) {
             user.employerVerification.status = 'Rejected';
             // Create notification for employer
             const Notification = require('../models/Notification');
             await Notification.create({
                 recipient: user._id,
                 sender: req.user._id, // Admin
                 type: 'SYSTEM',
                 message: `Your verification document (${document.type}) was rejected. Reason: ${rejectionReason || 'Not specified'}. Please re-upload.`,
                 relatedId: user._id,
                 relatedModel: 'User'
             });

             // Send Email
             try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verification Document Rejected - Job Portal',
                    message: `Your document (${document.type}) was rejected. Reason: ${rejectionReason || 'Not specified'}. Please login to re-upload.`,
                    html: `
                        <h3>Document Rejected</h3>
                        <p>Your document (<strong>${document.type}</strong>) was rejected.</p>
                        <p><strong>Reason:</strong> ${rejectionReason || 'Not specified'}</p>
                        <p>Please login to your dashboard and re-upload the correct document.</p>
                    `
                });
            } catch (err) {
                console.error("Email send failed", err);
            }
        }

        await user.save();
        res.json({ message: 'Verification status updated', user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getJobSeekers,
    getEmployers,
    getCompanies,
    toggleUserStatus,
    getPendingVerifications,
    updateVerificationStatus
};
