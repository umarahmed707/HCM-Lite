import { prisma } from '../config/db.js';
import { getDistanceMeters } from '../utils/geofence.js';

// Web or Camera Geofence Check-in
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) {
      return res.status(400).json({ error: "Only registered employees can check in" });
    }

    const { lat, lng, source = 'web' } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Rule 1: One check-in per day (409 Conflict)
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId, date: today }
      }
    });

    if (existingRecord && existingRecord.checkIn) {
      return res.status(409).json({ error: "Already checked in today" });
    }

    // Rule 2: Geofence Validation
    const settings = await prisma.companySetting.findFirst();
    if (settings && settings.officeLat && settings.officeLng && settings.officeRadiusMeters) {
      if (!lat || !lng) {
        return res.status(400).json({ error: "Location coordinates required for check-in" });
      }

      const distance = getDistanceMeters(lat, lng, settings.officeLat, settings.officeLng);
      if (distance > settings.officeRadiusMeters) {
        return res.status(403).json({ 
          error: `Outside office geofence. You are ${Math.round(distance)}m away (Max allowed: ${settings.officeRadiusMeters}m)` 
        });
      }
    }

    // Rule 3: Late Check Status
    const now = new Date();
    const [startHour, startMin] = (settings?.officeStart || '09:00').split(':').map(Number);
    const graceMinutes = settings?.graceMinutes || 15;

    const graceTime = new Date();
    graceTime.setHours(startHour, startMin + graceMinutes, 0, 0);

    const status = now > graceTime ? 'LATE' : 'PRESENT';

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      update: { checkIn: now, status, source },
      create: {
        employeeId,
        date: today,
        checkIn: now,
        status,
        source
      }
    });

    res.json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: "No check-in record found for today" });
    }

    const now = new Date();
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now }
    });

    res.json({ message: "Check-out successful", attendance: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Attendance Board / Calendar
export const getAttendanceBoard = async (req, res) => {
  try {
    const { date, departmentId } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const whereClause = { date: targetDate };

    if (req.user.role === 'EMPLOYEE') {
      whereClause.employeeId = req.user.employeeId;
    } else if (departmentId) {
      whereClause.employee = { departmentId };
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};