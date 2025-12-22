// lib/pushNotification.js - Web Push Notification utilities
const webpush = require('web-push');

// Initialize web-push (if VAPID keys are set)
let isInitialized = false;

function initPushNotifications() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'noreply@travelgo.com';

  if (publicKey && privateKey) {
    webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
    isInitialized = true;
    console.log('✅ Push notifications initialized');
  } else {
    console.warn('⚠️  VAPID keys not set. Push notifications disabled.');
  }
}

/**
 * Send push notification to a subscription
 */
async function sendPushNotification(subscription, payload) {
  if (!isInitialized) {
    throw new Error('Push notifications not initialized. Set VAPID keys in .env');
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // If subscription is invalid, mark it as expired
    if (error.statusCode === 410) {
      return { expired: true };
    }
    
    throw error;
  }
}

/**
 * Send push notification to multiple subscriptions
 */
async function sendPushNotificationToMany(subscriptions, payload) {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification(sub, payload))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  const expired = results.filter(r => 
    r.status === 'fulfilled' && r.value?.expired
  ).length;

  return {
    successful,
    failed,
    expired,
    total: subscriptions.length,
  };
}

module.exports = {
  initPushNotifications,
  sendPushNotification,
  sendPushNotificationToMany,
};

