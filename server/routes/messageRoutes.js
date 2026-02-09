const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, markMessagesAsRead, deleteConversation, getTeamMemberConversations, getTeamMemberMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.put('/read/:senderId', protect, markMessagesAsRead);
router.delete('/:userId', protect, deleteConversation);
router.get('/team/:memberId/conversations', protect, getTeamMemberConversations);
router.get('/team/:memberId/:otherUserId', protect, getTeamMemberMessages);
router.get('/:userId', protect, getMessages);
router.get('/', protect, getConversations);


module.exports = router;
