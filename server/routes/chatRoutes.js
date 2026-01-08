const express = require('express');
const { chatWithGemini, getChatUsage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatWithGemini);
router.get('/usage', protect, getChatUsage);

module.exports = router;
