import express from 'express';
import { getAnnouncements, postAnnouncement, getAuditLogs } from '../controllers/commsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Announcements
router.get('/announcements', authenticateToken, getAnnouncements);
router.post('/announcements', authenticateToken, authorizeRoles('ADMIN', 'HR'), postAnnouncement);

// Audit Logs (Admin Only)
router.get('/audit-logs', authenticateToken, authorizeRoles('ADMIN'), getAuditLogs);

export default router;