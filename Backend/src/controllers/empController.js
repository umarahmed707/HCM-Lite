import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

// Register Employee (HR Only) -> Automatic creates User Login
export const registerEmployee = async (req, res) => {
  try {
    const { 
      email, 
      tempPassword, 
      role = 'EMPLOYEE', 
      employeeCode, 
      firstName, 
      lastName, 
      phone, 
      address, 
      departmentId, 
      designationId, 
      basicSalary 
    } = req.body;

    if (!email || !tempPassword || !employeeCode || !firstName || !lastName || !departmentId || !designationId || !basicSalary) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user or code already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const existingCode = await prisma.employee.findUnique({ where: { employeeCode } });
    if (existingCode) return res.status(400).json({ error: "Employee Code already in use" });

    // Hash Temp Password
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create User + Employee Profile in Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role === 'HR' ? 'HR' : 'EMPLOYEE',
          mustChangePass: true
        }
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          firstName,
          lastName,
          phone,
          address,
          departmentId,
          designationId,
          basicSalary: parseFloat(basicSalary)
        }
      });

      return { user, employee };
    });

    res.json({ message: "Employee registered successfully", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Employee Directory with Search & Pagination
export const getEmployees = async (req, res) => {
  try {
    const { search, departmentId } = req.query;

    const whereClause = {};
    if (departmentId) whereClause.departmentId = departmentId;
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } }
      ];
    }

    // RBAC Check: Employee can only see own profile unless Admin/HR
    if (req.user.role === 'EMPLOYEE') {
      whereClause.id = req.user.employeeId;
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        designation: true,
        user: { select: { email: true, role: true } }
      }
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Employee 360 Profile
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // RBAC: Employee can only view their own 360 profile
    if (req.user.role === 'EMPLOYEE' && req.user.employeeId !== id) {
      return res.status(403).json({ error: "Access denied to other employee profile" });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        user: { select: { email: true, role: true } },
        attendances: { take: 10, orderBy: { date: 'desc' } },
        leaveRequests: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};