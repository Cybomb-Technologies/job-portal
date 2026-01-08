const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  getEmployerStats,
  getRecommendedJobs
} = require('../controllers/jobController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createJob).get(getJobs);
router.route('/myjobs').get(protect, getMyJobs);
router.route('/stats').get(protect, getEmployerStats);
router.route('/recommendations').get(protect, getRecommendedJobs); // Add this BEFORE /:id
router.route('/:id').get(getJobById).put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
