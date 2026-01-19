const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    submitContact,
    getAllMessages,
    updateMessageStatus,
    replyToMessage
} = require('../controllers/contactController');

const router = express.Router();

router.route('/')
    .post(submitContact)
    .get(protect, admin, getAllMessages);

router.route('/:id')
    .put(protect, admin, updateMessageStatus);

router.route('/:id/reply')
    .post(protect, admin, replyToMessage);

module.exports = router;
