const express = require('express');
const router = express.Router();
const { authRequired, isAdmin } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
  sendBookingStatusUpdateEmail,
} = require('../lib/email');

/**
 * POST /api/email/send
 * Gửi email tùy chỉnh (Admin only)
 */
router.post('/send', authRequired, isAdmin, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ message: 'Missing required fields: to, subject' });
    }

    await sendEmail({ to, subject, html, text });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

/**
 * POST /api/email/test
 * Test email service (Admin only)
 */
router.post('/test', authRequired, isAdmin, async (req, res) => {
  try {
    const userEmail = req.user.email;
    await sendEmail({
      to: userEmail,
      subject: 'Test Email from TravelGo',
      html: '<h1>Test Email</h1><p>This is a test email from TravelGo email service.</p>',
    });
    res.json({ success: true, message: `Test email sent to ${userEmail}` });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
});

/**
 * POST /api/email/welcome
 * Gửi email chào mừng (Admin only hoặc tự động khi đăng ký)
 */
router.post('/welcome', authRequired, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendWelcomeEmail(user);
    res.json({ success: true, message: `Welcome email sent to ${user.email}` });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ message: 'Failed to send welcome email', error: error.message });
  }
});

module.exports = router;

