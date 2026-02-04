const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const dns = require('dns');
const util = require('util');
const sendEmail = require('../utils/sendEmail');

// Promisify DNS methods
const resolveMx = util.promisify(dns.resolveMx);

// Blocked Generic Email Domains
const GENERIC_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'live.com', 'icloud.com', 'aol.com', 'protonmail.com'
];

/**
 * @desc    Level 1: Send OTP for Email Verification
 * @route   POST /api/verification/send-otp
 * @access  Private (Employer only)
 */
const sendVerificationOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'Employer') {
            return res.status(403).json({ message: 'Only employers can be verified' });
        }

        const emailDomain = user.email.split('@')[1].toLowerCase();

        // Check 1: Is it a generic domain?
        if (GENERIC_DOMAINS.includes(emailDomain)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please use an official company email address (e.g., name@company.com). Generic emails like Gmail cannot be verified for Level 1.' 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP to user (expire in 10 mins)
        user.employerVerification.verificationOTP = otp;
        user.employerVerification.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send Email
        const message = `Your verification code for JobPortal is: ${otp}\n\nThis code will expire in 10 minutes.`;
        const html = `<p>Your verification code for JobPortal is: <b style="font-size: 1.25rem;">${otp}</b></p><p>This code will expire in 10 minutes.</p>`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Employer Verification Code',
                message,
                html
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your email.'
            });
        } catch (error) {
            console.error(error);
            user.employerVerification.verificationOTP = undefined;
            user.employerVerification.verificationOTPExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error request OTP' });
    }
};

/**
 * @desc    Level 1: Verify OTP
 * @route   POST /api/verification/verify-otp
 * @access  Private (Employer only)
 */
const verifyEmailOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id);

        if (!user || !user.employerVerification.verificationOTP) {
             return res.status(400).json({ message: 'Invalid request or OTP expired' });
        }

        if (user.role !== 'Employer') {
             return res.status(403).json({ message: 'Only employers can be verified' });
        }

        // Check OTP
        if (user.employerVerification.verificationOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check Expiry
        if (user.employerVerification.verificationOTPExpire < Date.now()) {
             return res.status(400).json({ message: 'OTP Expired' });
        }

        // Pass Email Verification
        user.employerVerification.emailVerified = true;
        user.employerVerification.verificationOTP = undefined;
        user.employerVerification.verificationOTPExpire = undefined;

        // Level 1 logic: Requires BOTH Email Verification AND ID Card Approval
        if (user.employerVerification.idCard && user.employerVerification.idCard.status === 'Approved') {
            if (user.employerVerification.level < 1) {
                user.employerVerification.level = 1;
                user.employerVerification.status = 'Verified';
            }
        }
        
        await user.save();

        // Sync with Company
        if (user.companyId) {
            const company = await Company.findById(user.companyId);
            if (company) {
                 company.employerVerification.emailVerified = true;
                 
                 // Only upgrade company level if the user meets all criteria
                 if (user.employerVerification.level >= 1 && company.employerVerification.level < 1) {
                     company.employerVerification.level = 1;
                     company.employerVerification.status = 'Verified';
                 }
                 await company.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Please complete ID Card verification to reach Level 1.',
            level: user.employerVerification.level
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verification' });
    }
};

/**
 * @desc    Level 1: Upload ID Card
 * @route   POST /api/verification/upload-id-card
 * @access  Private (Employer only)
 */
const uploadIdCard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);

        // Update ID Card Info
        user.employerVerification.idCard = {
            fileUrl: `/uploads/verification/${req.file.filename}`,
            status: 'Pending',
            uploadedAt: new Date()
        };

        // If rejection reason existed, clear it
        if (user.employerVerification.idCard.rejectionReason) {
             user.employerVerification.idCard.rejectionReason = undefined;
        }

        await user.save();

        // Notify Admins
        try {
            const admins = await User.find({ role: 'Admin' });
            for (const admin of admins) {
                await Notification.create({
                    recipient: admin._id,
                    sender: user._id,
                    type: 'SYSTEM',
                    message: `New ID Card uploaded by ${user.companyName || user.name}`,
                    relatedId: user._id,
                    relatedModel: 'User'
                });
            }
        } catch (error) {
            console.error('Error sending admin notification:', error);
        }

        res.status(200).json({
            success: true,
            message: 'ID Card uploaded successfully. Verification is pending approval.',
            idCard: user.employerVerification.idCard
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

/**
 * @desc    Level 2: Upload Business Documents
 * @route   POST /api/verification/upload-docs
 * @access  Private (Employer only)
 */
const uploadDocuments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { docType } = req.body; // GST, CIN, etc.

        if (!['GST', 'CIN', 'MSME', 'Other'].includes(docType)) {
             return res.status(400).json({ message: 'Invalid document type' });
        }

        const user = await User.findById(req.user._id);

        // Add document to array
        const newDoc = {
            type: docType,
            fileUrl: `/uploads/verification/${req.file.filename}`, 
            status: 'Pending',
            uploadedAt: new Date()
        };

        user.employerVerification.documents.push(newDoc);
        user.employerVerification.status = 'Pending'; 
        await user.save();

        // Sync with Company
        if (user.companyId) {
            const company = await Company.findById(user.companyId);
            if (company) {
                company.employerVerification.documents.push(newDoc);
                company.employerVerification.status = 'Pending';
                await company.save();
            }
        }

        // Notify Admins
        try {
            const admins = await User.find({ role: 'Admin' });
            for (const admin of admins) {
                await Notification.create({
                    recipient: admin._id,
                    sender: user._id,
                    type: 'SYSTEM',
                    message: `New verification document (${docType}) uploaded by ${user.companyName || user.name}`,
                    relatedId: user._id,
                    relatedModel: 'User'
                });
            }
        } catch (error) {
            console.error('Error sending admin notification:', error);
        }

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully. Verification is pending approval.',
            document: newDoc
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

/**
 * @desc    Get Verification Status
 * @route   GET /api/verification/status
 * @access  Private
 */
const getVerificationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('employerVerification companyId');
        let status = user.employerVerification.toObject();

        if (user.companyId) {
            let company;
            // Handle both ObjectId and custom String ID
            if (user.companyId.toString().startsWith('COMP-')) {
                 company = await Company.findOne({ companyId: user.companyId }).select('employerVerification');
            } else {
                 company = await Company.findById(user.companyId).select('employerVerification');
            }
            
            if (company) {
                // Check if Company is Level 2 Verified (Legal Business Verification)
                const companyIsLevel2 = 
                    (company.employerVerification?.level >= 2) || 
                    (company.employerVerification?.status === 'Verified') ||
                    (company.employerVerification?.documents?.some(doc => doc.status === 'Approved' && ['GST', 'CIN', 'MSME'].includes(doc.type)));

                    if (companyIsLevel2) {
                     status.inheritedFromCompany = true; 
                     // ONLY upgrade to Level 2 if the user has completed Level 1 (Personal Identity)
                     // Recruiters must verify themselves (Level 0 -> 1) before inheriting Company Level 2.
                     if (status.level === 1) {
                         status.level = 2;
                     }
                }

                // Self-Healing: If User is Admin & Verified (Level 2), but Company is NOT, upgrade Company.
                // This fixes data inconsistency where Admin was verified but sync failed.
                if (status.level >= 2 && !companyIsLevel2 && user.companyRole === 'Admin') {
                    console.log(`Self-healing: Upgrading Company ${company._id} to Level 2 based on User ${user._id} status`);
                    
                    // Re-fetch company to save (since we only selected employerVerification earlier)
                    const companyToUpdate = await Company.findById(company._id);
                    if (companyToUpdate) {
                        companyToUpdate.employerVerification.level = 2;
                        companyToUpdate.employerVerification.status = 'Verified';
                        await companyToUpdate.save();
                    }
                }
            }
        }
        
        res.status(200).json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendVerificationOTP,
    verifyEmailOTP,
    uploadIdCard,
    uploadDocuments,
    getVerificationStatus
};
