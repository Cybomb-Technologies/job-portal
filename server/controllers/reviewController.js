const Review = require('../models/Review');
const User = require('../models/User');
const Company = require('../models/Company');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { logActivity } = require('./activityLogController');

/**
 * @desc    Submit a new review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
    try {
        const { companyId, rating, comment, reviewerType, role, department, employeeEmail, title } = req.body;

        if (!companyId || !rating || !comment || !reviewerType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Public reviews REQUIRE login
        if (reviewerType === 'Public' && !req.user) {
            return res.status(401).json({ message: 'You must be logged in to leave a public review. For employee reviews, please use your work email.' });
        }

        // Check if company exists (Handle both User ID and Company ID)
        let companyUser = await User.findById(companyId);
        let companyObj = null;

        if (companyUser) {
            // If the ID passed was a User ID, try to find the associated Company document
            if (companyUser.companyId) {
                companyObj = await Company.findById(companyUser.companyId);
            }
        } else {
            // Try as Company ID
            companyObj = await Company.findById(companyId);
            if (companyObj) {
                // Find Admin user for this company
                companyUser = await User.findOne({ companyId: companyId, companyRole: 'Admin' });
                
                // Fallback: If no explicit Admin found, take any Employer linked to this company
                // This handles legacy users or cases where companyRole might be missing
                if (!companyUser) {
                    companyUser = await User.findOne({ companyId: companyId, role: 'Employer' });
                }
            }
        }

        if (!companyUser || companyUser.role !== 'Employer') {
            return res.status(404).json({ message: 'Company not found' });
        }

        const reviewData = {
            reviewer: req.user?._id, // Optional for employees
            company: companyUser._id, // Always store User ID
            rating,
            comment,
            reviewerType,
            title,
            employeeEmail // Store for verification
        };

        if (reviewerType === 'Employee') {
            if (!role || !department || !employeeEmail) {
                return res.status(400).json({ message: 'Role, Department and Employee Email are required for employee reviews' });
            }

            // Determine the website to verify against (prefer Company document, fallback to User profile)
            const websiteToVerify = companyObj?.website || companyUser.website;

            // Strict domain check vs company website
            if (websiteToVerify) {
                // Extract domain from website (e.g., google.com from https://www.google.com/about)
                const companyDomain = websiteToVerify
                    .replace('https://', '')
                    .replace('http://', '')
                    .replace('www.', '')
                    .split('/')[0]
                    .toLowerCase();

                // Extract domain from provided employee email
                const emailParts = employeeEmail.toLowerCase().split('@');
                const providedDomain = emailParts[emailParts.length - 1];

                // Check if the email domain matches the company domain
                // We allow .com and .com.au to be interchangeable for the same base name
                const normalize = (dom) => dom.replace('.com.au', '').replace('.com', '');
                const normalizedCompany = normalize(companyDomain);
                const normalizedProvided = normalize(providedDomain);

                const isDirectMatch = providedDomain === companyDomain || providedDomain.endsWith('.' + companyDomain);
                const isCrossTldMatch = normalizedCompany === normalizedProvided && 
                                       (providedDomain.endsWith('.com') || providedDomain.endsWith('.com.au')) &&
                                       (companyDomain.endsWith('.com') || companyDomain.endsWith('.com.au'));

                if (!isDirectMatch && !isCrossTldMatch) {
                    return res.status(400).json({ 
                        message: `Invalid email domain. Reviews for ${companyUser.companyName || companyObj?.name} must be verified using a @${companyDomain} (or .com equivalent) email address.` 
                    });
                }
            } else {
                return res.status(400).json({ 
                    message: `This company has not verified their official domain yet. Personal reviews are currently limited to public posts.` 
                });
            }

            const verificationToken = crypto.randomBytes(20).toString('hex');
            reviewData.role = role;
            reviewData.department = department;
            reviewData.verificationToken = verificationToken;
            reviewData.isVerified = false; // Must verify via email
            reviewData.isAnonymous = true;
        }

        const review = await Review.create(reviewData);

        if (reviewerType === 'Employee') {
            // Send verification email
            // Prefer SERVER_URL from env, fallback to request host
            const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
            const verifyUrl = `${baseUrl}/api/reviews/verify/${review.verificationToken}`;
            
            const companyName = companyObj?.name || companyUser.companyName || companyUser.name;
            const message = `Please verify your employment at ${companyName} by clicking the link below: \n\n ${verifyUrl}`;
            
            try {
                await sendEmail({
                    email: employeeEmail,
                    subject: `Employment Verification for ${companyName}`,
                    message,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #4169E1;">Verify Your Employment</h2>
                            <p>You submitted a review for <strong>${companyName}</strong>.</p>
                            <p>Please click the button below to verify your email address and publish your review.</p>
                            <a href="${verifyUrl}" style="background-color: #4169E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Employment</a>
                            <p style="margin-top: 20px; font-size: 12px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="font-size: 12px; color: #555;">${verifyUrl}</p>
                        </div>
                    `
                });
                return res.status(201).json({ 
                    message: 'Review submitted. Please check your workplace email to verify and publish.',
                    reviewId: review._id 
                });
            } catch (err) {
                console.error('Email send failed:', err);
                return res.status(500).json({ message: 'Review saved but verification email failed to send.' });
            }
        }

        res.status(201).json(review);
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Verify employee review
 * @route   GET /api/reviews/verify/:token
 * @access  Public
 */
const verifyReview = async (req, res) => {
    try {
        const review = await Review.findOne({ verificationToken: req.params.token });

        if (!review) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        review.isVerified = true;
        review.verificationToken = undefined;
        await review.save();

        res.send('<h1>Verification Successful!</h1><p>Your review has been verified and published. You can now close this window.</p>');
    } catch (error) {
        console.error('Verify Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get all reviews for the logged-in employer
 * @route   GET /api/reviews/my/all
 * @access  Private (Employer only)
 */
const getMyReviews = async (req, res) => {
    try {
        // Find reviews for this employer (or any member of their company)
        let targetIds = [req.user._id];

        if (req.user.companyId) {
             // Find all users linked to this company (Admin + Recruiters)
            const companyUsers = await User.find({ companyId: req.user.companyId }).select('_id');
            if (companyUsers.length > 0) {
                targetIds = companyUsers.map(u => u._id);
            }
        }

        const reviews = await Review.find({ company: { $in: targetIds } })
            .populate('reviewer', 'name profilePicture email')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get My Reviews Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get company reviews
 * @route   GET /api/reviews/company/:id
 * @access  Public
 */
const getCompanyReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { sort = 'newest', rating } = req.query;

        let targetIds = [id];

        // check if ID is a Company ID
        const companyObj = await Company.findById(id);
        if (companyObj) {
             const companyUsers = await User.find({ companyId: id }).select('_id');
             if (companyUsers.length > 0) {
                 targetIds = companyUsers.map(u => u._id);
             }
        }

        let query = { 
            company: { $in: targetIds }, 
            isVerified: true, 
            isHidden: false 
        };

        if (rating) {
            query.rating = Number(rating);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'highest') sortOption = { rating: -1 };
        if (sort === 'lowest') sortOption = { rating: 1 };

        const reviews = await Review.find(query)
            .populate('reviewer', 'name profilePicture')
            .sort(sortOption);

        // Sanitize anonymous reviews
        const sanitizedReviews = reviews.map(review => {
            const obj = review.toObject();
            if (obj.reviewerType === 'Employee' && obj.isAnonymous) {
                delete obj.reviewer; // Hide real user info
            }
            return obj;
        });

        res.json(sanitizedReviews);
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Toggle review visibility (Moderate)
 * @route   PATCH /api/reviews/:id/visibility
 * @access  Private (Employer only)
 */
const toggleReviewVisibility = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the company being reviewed (or its recruiters) can moderate
        let authorizedIds = [req.user._id];

        if (req.user.companyId) {
             // Find all users linked to this company
            const companyUsers = await User.find({ companyId: req.user.companyId }).select('_id');
            if (companyUsers.length > 0) {
                authorizedIds = companyUsers.map(u => u._id.toString());
            }
        }
        
        // Check if the review's company ID is in the list of authorized IDs
        // Note: review.company is an ObjectId, so we convert to string
        if (!authorizedIds.includes(review.company.toString())) {
             // Fallback: Check if req.user._id matches directly (redundant but safe)
             if (review.company.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to moderate this review' });
             }
        }

        review.isHidden = !review.isHidden;
        await review.save();

        await logActivity(req.user, 'REVIEW_HIDE', `Review ${review.isHidden ? 'Hidden' : 'Visible'}`, review._id, 'Review');

        res.json({ message: `Review is now ${review.isHidden ? 'hidden' : 'visible'}`, isHidden: review.isHidden });
    } catch (error) {
        console.error('Toggle Visibility Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    verifyReview,
    getMyReviews,
    getCompanyReviews,
    toggleReviewVisibility
};
