const Review = require('../models/Review');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * @desc    Submit a new review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
    try {
        const { companyId, rating, comment, reviewerType, role, department, employeeEmail } = req.body;

        if (!companyId || !rating || !comment || !reviewerType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if company exists
        const company = await User.findById(companyId);
        if (!company || company.role !== 'Employer') {
            return res.status(404).json({ message: 'Company not found' });
        }

        const reviewData = {
            reviewer: req.user._id,
            company: companyId,
            rating,
            comment,
            reviewerType,
        };

        if (reviewerType === 'Employee') {
            if (!role || !department || !employeeEmail) {
                return res.status(400).json({ message: 'Role, Department and Employee Email are required for employee reviews' });
            }

            // Strict domain check vs company website
            if (company.website) {
                // Extract domain from website (e.g., google.com from https://www.google.com/about)
                const companyDomain = company.website
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
                        message: `Invalid email domain. Reviews for ${company.companyName} must be verified using a @${companyDomain} (or .com equivalent) email address.` 
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
            const verifyUrl = `${req.protocol}://${req.get('host')}/api/reviews/verify/${review.verificationToken}`;
            const message = `Please verify your employment at ${company.companyName} by clicking the link below: \n\n ${verifyUrl}`;
            
            try {
                await sendEmail({
                    email: employeeEmail,
                    subject: 'Employment Verification for Review',
                    message,
                    html: `<p>Please verify your employment at <strong>${company.companyName}</strong> to publish your review.</p><p><a href="${verifyUrl}">Click here to verify</a></p>`
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
        // Find reviews for this employer
        const reviews = await Review.find({ company: req.user._id })
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

        let query = { 
            company: id, 
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

        // Only the company being reviewed can moderate
        if (review.company.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to moderate this review' });
        }

        review.isHidden = !review.isHidden;
        await review.save();

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
