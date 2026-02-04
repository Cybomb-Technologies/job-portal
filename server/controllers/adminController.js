const User = require('../models/User');
const Job = require('../models/Job');
const CompanyUpdateRequest = require('../models/CompanyUpdateRequest');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
// Helper to calculate growth
const calculateGrowth = async (Model, query = {}) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const total = await Model.countDocuments(query);
    const totalLastMonth = await Model.countDocuments({
        ...query,
        createdAt: { $lt: lastMonth }
    });

    let growth = 0;
    if (totalLastMonth > 0) {
        growth = ((total - totalLastMonth) / totalLastMonth) * 100;
    } else if (total > 0) {
        growth = 100; // 100% growth if started from 0
    }

    return { total, growth: parseFloat(growth.toFixed(1)) };
};

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const jobs = await calculateGrowth(Job);
        const jobSeekers = await calculateGrowth(User, { role: 'Job Seeker' });
        const employers = await calculateGrowth(User, { role: 'Employer' });
        const verifiedEmployers = await calculateGrowth(User, { 
            role: 'Employer', 
            'employerVerification.status': 'Verified' 
        });

        // Companies Growth (approximate using unique company names created)
        // Since we can't easily track distinct company growth over time without aggregation on timestamps,
        // we'll use the Employer creation as a proxy for company growth for now or simple count.
        // Better approach: Count unique companies now, and unique companies from users created < 30 days ago.
        
        const companiesTotalList = await User.distinct('companyName', { role: 'Employer' });
        const totalCompanies = companiesTotalList.length;

        // For efficiency, let's just use employer growth as a proxy for company growth or 0 for now 
        // if exact historical distinct count is too expensive. 
        // Let's try to do it right:
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const companiesLastMonthList = await User.distinct('companyName', { 
            role: 'Employer',
            createdAt: { $lt: lastMonth }
        });
        const totalCompaniesLastMonth = companiesLastMonthList.length;

        let companiesGrowth = 0;
        if (totalCompaniesLastMonth > 0) {
            companiesGrowth = ((totalCompanies - totalCompaniesLastMonth) / totalCompaniesLastMonth) * 100;
        } else if (totalCompanies > 0) {
            companiesGrowth = 100;
        }

        res.json({
            jobs,
            jobSeekers,
            employers,
            verifiedEmployers,
            companies: { total: totalCompanies, growth: parseFloat(companiesGrowth.toFixed(1)) }
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
        })
        .select('name email companyName employerVerification companyId');

        // Robust Company Fetching
        const companyIds = pendingUsers
            .map(u => u.companyId)
            .filter(id => id); // Filter nulls

        const Company = require('../models/Company');
        const mongoose = require('mongoose');
        
        const companies = await Company.find({
            $or: [
                { _id: { $in: companyIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
                { companyId: { $in: companyIds.filter(id => !mongoose.Types.ObjectId.isValid(id)) } }
            ]
        }).select('name companyId');

        const companyMap = {};
        companies.forEach(c => {
            companyMap[c._id.toString()] = c.name;
            if (c.companyId) companyMap[c.companyId] = c.name;
        });

        const formattedUsers = pendingUsers.map(user => ({
            ...user.toObject(),
            companyName: user.companyName || (user.companyId ? companyMap[user.companyId.toString()] : 'No Company Name')
        }));

        res.json(formattedUsers);
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

            // Sync with Company
            if (user.companyId) {
                try {
                    const Company = require('../models/Company');
                    let company;
                    if (user.companyId.toString().startsWith('COMP-')) {
                        company = await Company.findOne({ companyId: user.companyId });
                    } else {
                        company = await Company.findById(user.companyId);
                    }

                    if (company) {
                        company.employerVerification.level = 2;
                        company.employerVerification.status = 'Verified';
                        // Ensure documents are also synced if needed, but level is most important
                        await company.save();
                        console.log(`Synced verification status to Company: ${company.name}`);
                    } else {
                        console.warn(`Could not find company to sync verification. User.companyId: ${user.companyId}`);
                    }
                } catch (syncError) {
                    console.error('Error syncing company verification:', syncError);
                }
            }

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

// @desc    Get pending ID card verifications
// @route   GET /api/admin/verifications/id-cards
// @access  Private/Admin
const getPendingIdVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.find({
            role: 'Employer',
            'employerVerification.idCard.status': 'Pending'
        })
        .select('name email companyName employerVerification.idCard companyId');

        // Robust Company Fetching
        const companyIds = pendingUsers
            .map(u => u.companyId)
            .filter(id => id);

        const Company = require('../models/Company');
        const mongoose = require('mongoose');
        
        const companies = await Company.find({
            $or: [
                { _id: { $in: companyIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
                { companyId: { $in: companyIds.filter(id => !mongoose.Types.ObjectId.isValid(id)) } }
            ]
        }).select('name companyId');

        const companyMap = {};
        companies.forEach(c => {
            companyMap[c._id.toString()] = c.name;
            if (c.companyId) companyMap[c.companyId] = c.name;
        });

        const formattedUsers = pendingUsers.map(user => ({
            ...user.toObject(),
            companyName: user.companyName || (user.companyId ? companyMap[user.companyId.toString()] : 'No Company Name')
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify ID Card
// @route   PUT /api/admin/verification/:userId/id-card
// @access  Private/Admin
const verifyIdCard = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, rejectionReason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.employerVerification.idCard.status = status;
        
        if (status === 'Rejected') {
            user.employerVerification.idCard.rejectionReason = rejectionReason;
            
             // Notify via Email
             try {
                await sendEmail({
                    email: user.email,
                    subject: 'ID Verification Rejected - Job Portal',
                    message: `Your ID Card verification was rejected. Reason: ${rejectionReason}.`,
                    html: `<p>Your ID Card verification was rejected.</p><p>Reason: ${rejectionReason}</p>`
                });
            } catch (err) { console.error(err); }

        } else if (status === 'Approved') {
            user.employerVerification.idCard.rejectionReason = undefined;

            // Check if Email is also verified to Grant Level 1
            if (user.employerVerification.emailVerified) {
                if (user.employerVerification.level < 1) {
                    user.employerVerification.level = 1;
                    user.employerVerification.status = 'Verified';
                }
            }

            // Sync with Company
            if (user.companyId) {
                const Company = require('../models/Company');
                let company;
                if (user.companyId.toString().startsWith('COMP-')) {
                    company = await Company.findOne({ companyId: user.companyId });
                } else {
                    company = await Company.findById(user.companyId);
                }

                if (company) {
                    // Start sync logic
                     if (user.employerVerification.level >= 1 && company.employerVerification.level < 1) {
                         company.employerVerification.level = 1;
                         company.employerVerification.status = 'Verified';
                     }
                     await company.save();
                }
            }

            // Notify via Email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'ID Verification Approved - Job Portal',
                    message: `Your ID Card has been verified.`,
                    html: `<p>Your ID Card has been verified successfully.</p>`
                });
            } catch (err) { console.error(err); }
        }

        await user.save();

        // System Notification
        await Notification.create({
            recipient: user._id,
            sender: req.user._id,
            type: 'SYSTEM',
            message: `Your ID Card verification is ${status}.`,
            relatedId: user._id,
            relatedModel: 'User'
        });

        res.json({ message: 'ID Card verification updated', user });

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
    updateVerificationStatus,
    getPendingIdVerifications,
    verifyIdCard,
    getCompanyUpdateRequests: async (req, res) => {
        try {
            const requests = await CompanyUpdateRequest.find({ status: 'Pending' })
                .populate('companyId') // Populate full company details for comparison
                .populate('requesterId', 'name email')
                .sort({ createdAt: -1 });
            res.json(requests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCompanyUpdateHistory: async (req, res) => {
        try {
            const history = await CompanyUpdateRequest.find({ status: { $ne: 'Pending' } })
                .populate('companyId', 'name')
                .populate('requesterId', 'name email')
                .populate('processedBy', 'name')
                .sort({ processedAt: -1 });
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    approveCompanyUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const request = await CompanyUpdateRequest.findById(id);
            if (!request) return res.status(404).json({ message: 'Request not found' });

            const Company = require('../models/Company');
            let company;
            // Handle custom string ID
            if (request.companyId.toString().startsWith('COMP-')) {
                 company = await Company.findOne({ companyId: request.companyId });
            } else {
                 company = await Company.findById(request.companyId);
            }
            
            if (!company) return res.status(404).json({ message: 'Company not found' });

            // Apply updates
            const updates = request.requestedChanges;
            for (const key in updates) {
                if (Object.prototype.hasOwnProperty.call(updates, key)) {
                    company[key] = updates[key];
                }
            }

            await company.save();

            request.status = 'Approved';
            request.processedBy = req.user._id;
            request.processedAt = new Date();
            await request.save();

            // Notify Requester
            const notification = await Notification.create({
                recipient: request.requesterId,
                sender: req.user._id, // Admin
                type: 'COMPANY_UPDATE',
                message: `Your company update request has been approved.`,
                relatedId: request.companyId, // Link to company profile
                relatedModel: 'User' // Redirect to profile or dashboard
            });

            if (req.io) {
                 req.io.to(request.requesterId.toString()).emit('notification', {
                    message: `Your company update request has been approved.`,
                    type: 'COMPANY_UPDATE'
                });
            }

            res.json({ message: 'Company profile updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    rejectCompanyUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const request = await CompanyUpdateRequest.findById(id);
            if (!request) return res.status(404).json({ message: 'Request not found' });

            request.status = 'Rejected';
            request.adminComments = reason;
            request.processedBy = req.user._id;
            request.processedAt = new Date();
            await request.save();

            // Notify Requester
             const notification = await Notification.create({
                recipient: request.requesterId,
                sender: req.user._id,
                type: 'COMPANY_UPDATE',
                message: `Update request rejected: ${reason}`,
                relatedId: request.companyId,
                relatedModel: 'User'
            });

            if (req.io) {
                req.io.to(request.requesterId.toString()).emit('notification', {
                    message: `Update request rejected: ${reason}`,
                    type: 'COMPANY_UPDATE'
                });
            }

            res.json({ message: 'Update request rejected' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
