import { prisma } from '../config/db.js';

// AI Tool Definitions for Gemini API
export const aiToolsDeclaration = [
  {
    name: 'get_headcount',
    description: 'Get total active employee count and breakdown by department',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'get_attendance_summary',
    description: 'Get overall attendance statistics for today or a specific date',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'Date in YYYY-MM-DD format (optional)' }
      }
    }
  },
  {
    name: 'get_my_leave_balance',
    description: 'Get the current user remaining leave balance',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'get_payroll_summary',
    description: 'Get total monthly payroll cost and salary summary',
    parameters: {
      type: 'OBJECT',
      properties: {
        month: { type: 'NUMBER', description: 'Month (1-12)' },
        year: { type: 'NUMBER', description: 'Year (e.g. 2026)' }
      }
    }
  }
];

// Tool Execution Handler
export async function executeAiTool(toolName, args, user) {
  try {
    switch (toolName) {
      case 'get_headcount': {
        const total = await prisma.employee.count();
        const depts = await prisma.department.findMany({
          include: { _count: { select: { employees: true } } }
        });
        return { totalEmployees: total, departmentBreakdown: depts.map(d => ({ department: d.name, count: d._count.employees })) };
      }

      case 'get_attendance_summary': {
        const targetDate = args.date ? new Date(args.date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const records = await prisma.attendance.findMany({ where: { date: targetDate } });
        const present = records.filter(r => r.status === 'PRESENT').length;
        const late = records.filter(r => r.status === 'LATE').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;

        return { date: targetDate.toISOString().split('T')[0], present, late, absent, totalRecords: records.length };
      }

      case 'get_my_leave_balance': {
        if (!user.employeeId) return { error: 'User is not linked to an employee profile' };
        
        const approvedLeaves = await prisma.leaveRequest.aggregate({
          where: { employeeId: user.employeeId, status: 'APPROVED' },
          _sum: { daysCount: true }
        });

        const usedDays = approvedLeaves._sum.daysCount || 0;
        const annualQuota = 14;
        const sickQuota = 8;
        const casualQuota = 10;

        return {
          annualRemaining: Math.max(0, annualQuota - usedDays),
          sickRemaining: sickQuota,
          casualRemaining: casualQuota,
          totalUsed: usedDays
        };
      }

      case 'get_payroll_summary': {
        // RBAC Restriction: Employee cannot see full payroll summary[cite: 1]
        if (user.role === 'EMPLOYEE') {
          return { error: 'Access denied: Employees cannot view company payroll summaries.' };
        }

        const run = await prisma.payrollRun.findFirst({
          where: { month: args.month || new Date().getMonth() + 1, year: args.year || new Date().getFullYear() }
        });

        if (!run) return { message: 'No payroll run found for the given month.' };
        return { totalGross: run.totalGross, totalNet: run.totalNet, isFinalized: run.isFinalized };
      }

      default:
        return { error: `Tool ${toolName} not implemented` };
    }
  } catch (err) {
    return { error: err.message };
  }
}