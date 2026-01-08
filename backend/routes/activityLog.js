// routes/activityLog.js - Activity Log management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/activity-log - Get activity logs (Admin only)
router.get('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 50, action, entityType, userId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const where = {
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(userId && { userId: parseInt(userId) }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(pageSize),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Lỗi lấy nhật ký hoạt động' });
  }
});

// GET /api/activity-log/stats - Get activity statistics (Admin only)
router.get('/stats', authRequired, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      } : {}),
    };

    const [totalActions, actionsByType, topUsers, recentActions] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      prisma.activityLog.groupBy({
        by: ['userId'],
        where: {
          ...where,
          userId: { not: null },
        },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      totalActions,
      actionsByType,
      topUsers,
      recentActions,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Lỗi lấy thống kê hoạt động' });
  }
});

module.exports = router;

