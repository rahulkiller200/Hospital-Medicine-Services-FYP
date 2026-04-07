const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatbotController = require('../controllers/ChatbotController');

const isAdmin = require('../middleware/isAdmin');

// It's a public route for general medical assistance
router.post('/ask', chatbotController.askChatbot);

// Admin restricted endpoint
router.post('/wipe', authMiddleware, isAdmin, chatbotController.wipeMemory);

module.exports = router;
