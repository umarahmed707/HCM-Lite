import express from 'express';
import { 
  getCompanySettings, 
  updateCompanySettings, 
  getDepartments, 
  createDepartment, 
  getDesignations, 
  createDesignation 
} from '../controllers/orgController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/settings', authenticateToken, getCompanySettings);
router.put('/settings', authenticateToken, authorizeRoles('ADMIN'), updateCompanySettings);

router.get('/departments', authenticateToken, getDepartments);
router.post('/departments', authenticateToken, authorizeRoles('ADMIN'), createDepartment);

router.get('/designations', authenticateToken, getDesignations);
router.post('/designations', authenticateToken, authorizeRoles('ADMIN'), createDesignation);

export default router;