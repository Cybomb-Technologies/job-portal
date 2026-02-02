const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Employer'), getLogs);

module.exports = router;
