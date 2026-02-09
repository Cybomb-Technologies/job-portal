const express = require('express');
const router = express.Router();
const { getCandidates, getCandidateById, getCandidateBySlug, getCandidateBySlugAuth } = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');

// Public route for profile sharing (must be before protected routes)
router.get('/public/:slug', getCandidateBySlug);

// Using protect middleware to ensure only logged in users (and ideally employers) can search
// Assuming 'protect' adds req.user.
// Note: We might want to add an 'employer' specific middleware later, but 'protect' is good for now.

router.get('/', protect, getCandidates);
router.get('/slug/:slug', protect, getCandidateBySlugAuth);
router.get('/:id', protect, getCandidateById);

module.exports = router;

