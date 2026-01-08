// lib/activityLogger.js - Activity logging utility
const prisma = require('./prisma');

/**
 * Log an activity
 * @param {Object} options
 * @param {number} options.userId - User ID who performed the action
 * @param {string} options.action - Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} options.entityType - Entity type (USER, TOUR, DESTINATION, etc.)
 * @param {number} options.entityId - ID of the affected entity
 * @param {string} options.description - Human-readable description
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent string
 * @param {Object} options.metadata - Additional metadata
 */
async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  description,
  ipAddress,
  userAgent,
  metadata,
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId || null,
        description,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: metadata || null,
      },
    });
  } catch (error) {
    // Don't throw error - logging should not break the main flow
    console.error('Error logging activity:', error);
  }
}

module.exports = { logActivity };

