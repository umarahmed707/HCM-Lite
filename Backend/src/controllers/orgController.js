import { prisma } from '../config/db.js';

// Get Company Settings
export const getCompanySettings = async (req, res) => {
  try {
    const settings = await prisma.companySetting.findFirst();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Company Settings (Admin Only)
export const updateCompanySettings = async (req, res) => {
  try {
    const { companyName, officeStart, graceMinutes, halfDayHours, weekendDays, officeLat, officeLng, officeRadiusMeters } = req.body;
    
    const settings = await prisma.companySetting.upsert({
      where: { id: "1" },
      update: { companyName, officeStart, graceMinutes, halfDayHours, weekendDays, officeLat, officeLng, officeRadiusMeters },
      create: { companyName, officeStart, graceMinutes, halfDayHours, weekendDays, officeLat, officeLng, officeRadiusMeters }
    });

    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Departments CRUD
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ include: { _count: { select: { employees: true } } } });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });

    const department = await prisma.department.create({ data: { name } });
    res.json({ message: "Department created", department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Designations CRUD
export const getDesignations = async (req, res) => {
  try {
    const designations = await prisma.designation.findMany({ include: { _count: { select: { employees: true } } } });
    res.json(designations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDesignation = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Designation title is required" });

    const designation = await prisma.designation.create({ data: { title } });
    res.json({ message: "Designation created", designation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};