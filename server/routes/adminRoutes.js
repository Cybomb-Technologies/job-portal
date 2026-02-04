const express = require('express');
const router = express.Router();
const {
    getStats,
    getJobSeekers,
    getEmployers,
    getCompanies,
    toggleUserStatus,
    getPendingVerifications,
    updateVerificationStatus,
    getCompanyUpdateRequests,
    approveCompanyUpdate,
    rejectCompanyUpdate,
    getCompanyUpdateHistory,
    getPendingIdVerifications,
    verifyIdCard
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/job-seekers', protect, admin, getJobSeekers);
router.get('/employers', protect, admin, getEmployers);
router.get('/companies', protect, admin, getCompanies);
router.put('/user/:id/toggle-status', protect, admin, toggleUserStatus);
router.get('/verifications', protect, admin, getPendingVerifications);
router.put('/verification/:userId/document/:documentId', protect, admin, updateVerificationStatus);

router.get('/verifications/id-cards', protect, admin, getPendingIdVerifications);
router.put('/verification/:userId/id-card', protect, admin, verifyIdCard);

router.get('/company-updates', protect, admin, getCompanyUpdateRequests);
router.put('/company-update/:id/approve', protect, admin, approveCompanyUpdate);
router.put('/company-update/:id/reject', protect, admin, rejectCompanyUpdate);
router.get('/company-updates/history', protect, admin, getCompanyUpdateHistory);

module.exports = router;
