const express = require('express');
const router = express.Router();
const {
    getStats,
    getJobSeekers,
    getEmployers,
    getCompanies,
    toggleUserStatus,
    getPendingVerifications,
    updateVerificationStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/job-seekers', protect, admin, getJobSeekers);
router.get('/employers', protect, admin, getEmployers);
router.get('/companies', protect, admin, getCompanies);
router.put('/user/:id/toggle-status', protect, admin, toggleUserStatus);
router.get('/verifications', protect, admin, getPendingVerifications);
router.put('/verification/:userId/document/:documentId', protect, admin, updateVerificationStatus);

module.exports = router;
