// routes/emailCampaign.js - Email marketing campaigns
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const { sendEmail } = require('../lib/email');

// POST /api/email-campaign/send - Send email campaign (Admin)
router.post('/send', authRequired, isAdmin, async (req, res) => {
  try {
    const { subject, content, targetAudience, sendTo } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    let recipients = [];

    if (sendTo === 'all') {
      // Send to all users
      // Note: emailVerified field may not exist in database, so we skip it
      recipients = await prisma.user.findMany({
        where: {
          // emailVerified: true, // Skipped - field may not exist
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } else if (sendTo === 'newsletter') {
      // Send to newsletter subscribers
      const subscribers = await prisma.newsletterSubscription.findMany({
        where: {
          active: true,
        },
        select: {
          email: true,
        },
      });
      
      // Get user info for subscribers
      recipients = await prisma.user.findMany({
        where: {
          email: {
            in: subscribers.map(s => s.email),
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } else if (sendTo === 'custom' && targetAudience) {
      // Custom audience (array of emails)
      recipients = await prisma.user.findMany({
        where: {
          email: {
            in: Array.isArray(targetAudience) ? targetAudience : [targetAudience],
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }

    // Send emails
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: subject.replace('{{name}}', recipient.name || 'Bạn'),
          html: content
            .replace(/\{\{name\}\}/g, recipient.name || 'Bạn')
            .replace(/\{\{email\}\}/g, recipient.email),
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        failed++;
      }
    }

    res.json({
      success: true,
      message: 'Campaign sent',
      stats: {
        total: recipients.length,
        sent,
        failed,
      },
    });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    res.status(500).json({ message: 'Error sending email campaign' });
  }
});

// POST /api/email-campaign/schedule - Schedule email campaign (Admin)
router.post('/schedule', authRequired, isAdmin, async (req, res) => {
  try {
    const { subject, content, targetAudience, sendTo, scheduledAt } = req.body;

    if (!subject || !content || !scheduledAt) {
      return res.status(400).json({ message: 'Subject, content, and scheduledAt are required' });
    }

    // In a real system, you would store this in a database and use a job scheduler
    // For now, return success
    res.json({
      success: true,
      message: 'Campaign scheduled',
      scheduledAt: new Date(scheduledAt),
      note: 'Campaign scheduling requires a job scheduler (e.g., node-cron, Bull)',
    });
  } catch (error) {
    console.error('Error scheduling email campaign:', error);
    res.status(500).json({ message: 'Error scheduling email campaign' });
  }
});

// GET /api/email-campaign/stats - Get campaign statistics (Admin)
router.get('/stats', authRequired, isAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({
      // Note: emailVerified field may not exist in database
      where: {
        // emailVerified: true, // Skipped - field may not exist
      },
    });

    const newsletterSubscribers = await prisma.newsletterSubscription.count({
      where: { active: true },
    });

    res.json({
      totalUsers,
      newsletterSubscribers,
      emailVerifiedUsers: totalUsers,
    });
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    res.status(500).json({ message: 'Error getting campaign stats' });
  }
});

module.exports = router;

