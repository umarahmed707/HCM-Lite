import express from 'express';
import { chatWithAi, parseSmartLeave } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithAi);
router.post('/smart-leave', authenticateToken, parseSmartLeave);

export default router;