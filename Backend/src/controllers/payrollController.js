import { prisma } from '../config/db.js';

// Tax Slab Calculation (Annual Tax -> Monthly Tax)
function calculateAnnualTax(annualGross) {
  if (annualGross <= 600000) return 0;
  if (annualGross <= 1200000) return (annualGross - 600000) * 0.05;
  if (annualGross <= 2400000) return 30000 + (annualGross - 1200000) * 0.15;
  if (annualGross <= 3600000) return 210000 + (annualGross - 2400000) * 0.25;
  return 510000 + (annualGross - 3600000) * 0.35;
}

// 1. Create Monthly Payroll Draft (HR Only)
export const createPayrollRun = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and Year are required' });
    }

    // Check if payroll already exists for this month/year
    const existingRun = await prisma.payrollRun.findUnique({
      where: { month_year: { month: parseInt(month), year: parseInt(year) } }
    });

    if (existingRun && existingRun.isFinalized) {
      return res.status(400).json({ error: 'Payroll run for this month is already finalized and locked.' });
    }

    // If draft exists, clear old draft payslips to regenerate
    if (existingRun) {
      await prisma.payslip.deleteMany({ where: { payrollRunId: existingRun.id } });
      await prisma.payrollRun.delete({ where: { id: existingRun.id } });
    }

    const employees = await prisma.employee.findMany();
    if (employees.length === 0) {
      return res.status(400).json({ error: 'No employees found to run payroll.' });
    }

    const workingDays = 22; // Standard monthly working days
    let totalGross = 0;
    let totalNet = 0;

    const payrollRun = await prisma.payrollRun.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        totalGross: 0,
        totalNet: 0,
        isFinalized: false
      }
    });

    for (const emp of employees) {
      const basic = emp.basicSalary;
      const hra = basic * 0.4;       // HRA 40%
      const medical = basic * 0.1;   // Medical 10%
      const gross = basic + hra + medical; // Gross = 1.5 * Basic

      // Calculate absent count for deductions
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const absents = await prisma.attendance.count({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
          status: 'ABSENT'
        }
      });

      const perDaySalary = gross / workingDays;
      const deductions = absents * perDaySalary;
      const annualGross = gross * 12;
      const monthlyTax = calculateAnnualTax(annualGross) / 12;
      const netSalary = Math.max(0, gross - deductions - monthlyTax);

      totalGross += gross;
      totalNet += netSalary;

      await prisma.payslip.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: emp.id,
          basicSalary: basic,
          hra,
          medical,
          grossSalary: gross,
          deductions,
          tax: monthlyTax,
          netSalary
        }
      });
    }

    const updatedRun = await prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { totalGross, totalNet },
      include: { payslips: { include: { employee: true } } }
    });

    res.json({ message: 'Payroll draft created successfully', payrollRun: updatedRun });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Finalize Payroll (Admin Only - Locks the Month)
export const finalizePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const run = await prisma.payrollRun.findUnique({ where: { id } });
    if (!run) return res.status(404).json({ error: 'Payroll run not found' });

    if (run.isFinalized) {
      return res.status(400).json({ error: 'Payroll is already finalized and locked.' });
    }

    const finalizedRun = await prisma.payrollRun.update({
      where: { id },
      data: { isFinalized: true }
    });

    res.json({ message: 'Payroll finalized and locked successfully', payrollRun: finalizedRun });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Payslips / Monthly Payroll Summary
export const getPayslips = async (req, res) => {
  try {
    const { month, year } = req.query;
    const whereClause = {};

    if (month && year) {
      whereClause.payrollRun = {
        month: parseInt(month),
        year: parseInt(year)
      };
    }

    // Data Scope Guard: Employees can only view their own payslips
    if (req.user.role === 'EMPLOYEE') {
      whereClause.employeeId = req.user.employeeId;
    }

    const payslips = await prisma.payslip.findMany({
      where: whereClause,
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true } },
        payrollRun: { select: { month: true, year: true, isFinalized: true } }
      },
      orderBy: { id: 'desc' }
    });

    res.json(payslips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};