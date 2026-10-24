import { prisma } from '../config/db.js';

// Get Announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.auditLog.findMany({
      where: { entity: 'ANNOUNCEMENT' },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Post Announcement (Admin & HR Only)
export const postAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const actorId = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const log = await prisma.auditLog.create({
      data: {
        actorId,
        action: 'POST_ANNOUNCEMENT',
        entity: 'ANNOUNCEMENT',
        details: { title, message }
      }
    });

    res.json({ message: 'Announcement posted successfully', announcement: log });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Audit Logs (Admin Only)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: { select: { email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};