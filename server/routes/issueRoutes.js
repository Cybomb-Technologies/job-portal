const express = require('express');
const { createIssue, getIssues, updateIssueStatus, getUserIssues } = require('../controllers/issueController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// ... comments ...

router.post('/public', optionalProtect, createIssue);
router.get('/', protect, admin, getIssues);
router.get('/my-issues', protect, getUserIssues);
router.put('/:id/status', protect, admin, updateIssueStatus);

module.exports = router;
