import express from 'express';
import {
  checkSystemStatus,
  firstRunSetup,
  login,
  changePassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', checkSystemStatus);
router.post('/setup', firstRunSetup);
router.post('/login', login);
router.post('/change-password', authenticateToken, changePassword);

export default router;