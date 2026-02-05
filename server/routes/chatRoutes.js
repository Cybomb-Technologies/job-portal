const express = require('express');
const { chatWithGemini, getChatUsage, getChatHistory, getChatDetails } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatWithGemini);
router.get('/usage', protect, getChatUsage);
router.get('/history', protect, getChatHistory);
router.get('/:id', protect, getChatDetails);

module.exports = router;
