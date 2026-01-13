const express = require('express');
const {
    createReview,
    verifyReview,
    getMyReviews,
    getCompanyReviews,
    toggleReviewVisibility
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/company/:id')
    .get(getCompanyReviews);

router.route('/my/all')
    .get(protect, getMyReviews);

router.route('/verify/:token')
    .get(verifyReview);

router.route('/:id/visibility')
    .patch(protect, toggleReviewVisibility);

module.exports = router;
