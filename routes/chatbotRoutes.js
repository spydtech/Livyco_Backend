import express from 'express';
import { chatbotController } from '../controllers/chatbotController.js';
import { verifyToken } from '../utils/jwtUtils.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/chat', chatbotController.processMessage);
router.get('/faqs', chatbotController.getFAQs);
router.get('/session/:sessionId', chatbotController.getSessionInfo);
router.get('/health', chatbotController.healthCheck);

// Protected routes (require authentication)
router.get('/history/:sessionId', verifyToken, chatbotController.getHistory);
router.post('/feedback', verifyToken, chatbotController.submitFeedback);
router.post('/clear', verifyToken, chatbotController.clearConversation);

export default router;