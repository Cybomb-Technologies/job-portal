const express = require('express');
const { 
  addReview, 
  getReviews, 
  getMyReviews,
  toggleReviewVisibility 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/my/all', protect, getMyReviews);
router.get('/:employerId', getReviews);
router.put('/:id/visibility', protect, toggleReviewVisibility);

module.exports = router;
