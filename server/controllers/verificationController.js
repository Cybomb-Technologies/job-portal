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

        // Pass Level 1 (User)
        user.employerVerification.emailVerified = true;
        user.employerVerification.domainVerified = true; 
        user.employerVerification.verificationOTP = undefined;
        user.employerVerification.verificationOTPExpire = undefined;

        if (user.employerVerification.level < 1) {
            user.employerVerification.level = 1;
            user.employerVerification.status = 'Verified';
        }
        
        await user.save();

        // Sync with Company (Critical Fix)
        if (user.companyId) {
            const company = await Company.findById(user.companyId);
            if (company) {
                 company.employerVerification.emailVerified = true;
                 company.employerVerification.domainVerified = true;
                 
                 // If User is verified, Company uses that domain verification
                 if (company.employerVerification.level < 1) {
                     company.employerVerification.level = 1;
                     company.employerVerification.status = 'Verified';
                 }
                 await company.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You are now Level 1 Verified.',
            level: user.employerVerification.level
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verification' });
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
        const user = await User.findById(req.user._id).select('employerVerification');
        res.status(200).json(user.employerVerification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendVerificationOTP,
    verifyEmailOTP,
    uploadDocuments,
    getVerificationStatus
};
