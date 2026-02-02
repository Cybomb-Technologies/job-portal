const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, markMessagesAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.put('/read/:senderId', protect, markMessagesAsRead);
router.get('/:userId', protect, getMessages);
router.get('/', protect, getConversations);

module.exports = router;
