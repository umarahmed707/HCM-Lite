import { prisma } from '../config/db.js';

// Apply for Leave
export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ error: "Only employees can apply for leave" });

    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return res.status(400).json({ error: "Start date cannot be after end date" });
    }

    // Rule 1: Calculate Days (Skip Weekends)
    let daysCount = 0;
    let curr = new Date(start);
    while (curr <= end) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) { // Skip Sat (6) & Sun (0)
        daysCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (daysCount === 0) {
      return res.status(400).json({ error: "Selected range contains no working days" });
    }

    // Rule 2: Overlap Check (Status 422)
    const existingOverlap = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });

    if (existingOverlap) {
      return res.status(422).json({ error: "You already have an active leave request overlapping these dates" });
    }

    // Create Leave Request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start,
        endDate: end,
        daysCount,
        reason,
        status: 'PENDING'
      }
    });

    res.json({ message: "Leave applied successfully", leaveRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or Reject Leave (HR Only)
export const processLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body; // status: APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be APPROVED or REJECTED" });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status, comment }
    });

    res.json({ message: `Leave request ${status.toLowerCase()}`, leaveRequest: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Leave History / Inbox
export const getLeaves = async (req, res) => {
  try {
    const whereClause = {};

    if (req.user.role === 'EMPLOYEE') {
      whereClause.employeeId = req.user.employeeId;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};