import express from 'express';
import { createPayrollRun, finalizePayroll, getPayslips } from '../controllers/payrollController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate Payroll Draft (HR and Admin)
router.post('/run', authenticateToken, authorizeRoles('ADMIN', 'HR'), createPayrollRun);

// Finalize and Lock Payroll (Admin Only)
router.patch('/:id/finalize', authenticateToken, authorizeRoles('ADMIN'), finalizePayroll);

// Get Payslips (Admin, HR see all; Employee sees own)
router.get('/payslips', authenticateToken, getPayslips);

export default router;