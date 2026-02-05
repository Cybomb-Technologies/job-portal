const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getJobBySlug,
  getMyJobs,
  updateJob,
  deleteJob,
  getEmployerStats,
  getRecommendedJobs,
  getRelatedJobs
} = require('../controllers/jobController');

const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createJob).get(getJobs);
router.route('/myjobs').get(protect, getMyJobs);
router.route('/stats').get(protect, getEmployerStats);
router.route('/recommendations').get(protect, getRecommendedJobs); // Add this BEFORE /:id
router.get('/slug/:slug', optionalProtect, getJobBySlug); // Add GET /slug/:slug route
router.route('/:id/related').get(getRelatedJobs);
router.route('/:id').get(optionalProtect, getJobById).put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
