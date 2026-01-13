const express = require('express');
const router = express.Router();
const {
    getStats,
    getJobSeekers,
    getEmployers,
    getCompanies,
    toggleUserStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/job-seekers', protect, admin, getJobSeekers);
router.get('/employers', protect, admin, getEmployers);
router.get('/companies', protect, admin, getCompanies);
router.put('/user/:id/toggle-status', protect, admin, toggleUserStatus);

module.exports = router;
