// routes/pushNotification.js - Web Push Notification routes
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const { sendPushNotification, sendPushNotificationToMany } = require('../lib/pushNotification');

// POST /api/push/subscribe - Subscribe to push notifications
router.post('/subscribe', authRequired, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    // Store subscription in user's profile
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        pushSubscription: subscription,
      },
    });

    res.json({
      success: true,
      message: 'Subscribed to push notifications',
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ message: 'Error subscribing to push notifications' });
  }
});

// POST /api/push/unsubscribe - Unsubscribe from push notifications
router.post('/unsubscribe', authRequired, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        pushSubscription: null,
      },
    });

    res.json({
      success: true,
      message: 'Unsubscribed from push notifications',
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ message: 'Error unsubscribing from push notifications' });
  }
});

// GET /api/push/public-key - Get VAPID public key (for frontend)
router.get('/public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    return res.status(503).json({ message: 'Push notifications not configured' });
  }

  res.json({ publicKey });
});

// POST /api/push/test - Send test notification (for authenticated user)
router.post('/test', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { pushSubscription: true, name: true },
    });

    if (!user.pushSubscription) {
      return res.status(400).json({ message: 'No push subscription found' });
    }

    const payload = {
      title: 'Test Notification',
      body: `Hello ${user.name}! This is a test notification from TravelGo.`,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: '/account',
      },
    };

    await sendPushNotification(user.pushSubscription, payload);

    res.json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Error sending test notification' });
  }
});

// POST /api/push/admin/send - Send notification to all users (Admin)
router.post('/admin/send', authRequired, isAdmin, async (req, res) => {
  try {
    const { title, body, icon, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Get all users with push subscriptions
    const users = await prisma.user.findMany({
      where: {
        pushSubscription: {
          not: null,
        },
      },
      select: {
        id: true,
        pushSubscription: true,
      },
    });

    const subscriptions = users
      .map(u => u.pushSubscription)
      .filter(sub => sub && sub.endpoint);

    if (subscriptions.length === 0) {
      return res.json({
        success: true,
        message: 'No active subscriptions',
        sent: 0,
      });
    }

    const payload = {
      title,
      body,
      icon: icon || '/logo.png',
      badge: '/logo.png',
      data: {
        url: url || '/',
      },
    };

    const result = await sendPushNotificationToMany(subscriptions, payload);

    res.json({
      success: true,
      message: 'Notifications sent',
      ...result,
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({ message: 'Error sending push notifications' });
  }
});

module.exports = router;

