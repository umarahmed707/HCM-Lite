import express from 'express';
import { applyLeave, processLeave, getLeaves } from '../controllers/leaveController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', authenticateToken, applyLeave);
router.patch('/:id/process', authenticateToken, authorizeRoles('ADMIN', 'HR'), processLeave);
router.get('/', authenticateToken, getLeaves);

export default router;
