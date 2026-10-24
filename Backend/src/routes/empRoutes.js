import express from 'express';
import { registerEmployee, getEmployees, getEmployeeById } from '../controllers/empController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authenticateToken, authorizeRoles('ADMIN', 'HR'), registerEmployee);
router.get('/', authenticateToken, getEmployees);
router.get('/:id', authenticateToken, getEmployeeById);

export default router;