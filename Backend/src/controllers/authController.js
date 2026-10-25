import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// First-run system check
export const checkSystemStatus = async (req, res) => {
  try {
    const company = await prisma.companySetting.findFirst();
    res.json({ isSetupComplete: !!company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// First-Run Company & Admin Creation
export const firstRunSetup = async (req, res) => {
  try {
    const existingCompany = await prisma.companySetting.findFirst();
    if (existingCompany) {
      return res.status(400).json({ error: 'System is already configured' });
    }

    const { companyName, adminEmail, adminPassword } = req.body;

    if (!companyName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Company Name, Admin Email, and Password are required' });
    }

    // Default Company Settings
    const company = await prisma.companySetting.create({
      data: {
        companyName,
        officeStart: '09:00',
        graceMinutes: 15,
        halfDayHours: 5.0,
        weekendDays: ['Saturday', 'Sunday'],
        officeRadiusMeters: 150
      }
    });

    // Admin User Create
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        mustChangePass: false
      }
    });

    res.json({
      message: 'First-run setup completed successfully',
      company,
      adminId: adminUser.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { employeeProfile: true },
    });

    // Debug: password ya hash print mat karna
    console.log("Login email:", cleanEmail);
    console.log("User found:", Boolean(user));

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    console.log("Password matched:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const payload = {
      userId: user.id,
      employeeId: user.employeeProfile
        ? user.employeeProfile.id
        : null,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePass: user.mustChangePass,
        employeeProfile: user.employeeProfile,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};


// Change Password (Required on First Login for HR/Employees)
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.userId;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePass: false
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};