// routes/birthday.js - Birthday discount system
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { sendEmail } = require('../lib/email');

// GET /api/birthday/check - Check if user has birthday discount available
router.get('/check', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { dateOfBirth: true, name: true, email: true },
    });

    if (!user || !user.dateOfBirth) {
      return res.json({
        hasBirthday: false,
        message: 'Chưa cập nhật ngày sinh',
      });
    }

    const today = new Date();
    const birthday = new Date(user.dateOfBirth);
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());

    // Check if birthday is within next 7 days
    const daysUntilBirthday = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
    const isBirthdayMonth = today.getMonth() === birthday.getMonth();
    const isBirthdayToday = today.getDate() === birthday.getDate() && isBirthdayMonth;

    let discountAvailable = false;
    let discountPercent = 0;
    let validUntil = null;

    if (isBirthdayToday) {
      discountAvailable = true;
      discountPercent = 15; // 15% discount on birthday
      validUntil = new Date(today);
      validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days
    } else if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
      discountAvailable = true;
      discountPercent = 10; // 10% discount within 7 days before birthday
      validUntil = thisYearBirthday;
    } else if (isBirthdayMonth) {
      discountAvailable = true;
      discountPercent = 5; // 5% discount during birthday month
      validUntil = new Date(today.getFullYear(), birthday.getMonth() + 1, 0);
    }

    res.json({
      hasBirthday: true,
      discountAvailable,
      discountPercent,
      validUntil,
      daysUntilBirthday: daysUntilBirthday >= 0 ? daysUntilBirthday : null,
      isBirthdayToday,
      message: isBirthdayToday
        ? '🎉 Chúc mừng sinh nhật! Bạn được giảm 15%'
        : discountAvailable
        ? `Sinh nhật của bạn sắp đến! Bạn được giảm ${discountPercent}%`
        : 'Chưa đến thời gian áp dụng giảm giá sinh nhật',
    });
  } catch (error) {
    console.error('Error checking birthday discount:', error);
    res.status(500).json({ message: 'Error checking birthday discount' });
  }
});

// POST /api/birthday/update - Update user's date of birth
router.post('/update', authRequired, async (req, res) => {
  try {
    const { dateOfBirth } = req.body;

    if (!dateOfBirth) {
      return res.status(400).json({ message: 'Date of birth is required' });
    }

    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if date is in the future
    if (birthDate > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { dateOfBirth: birthDate },
      select: { id: true, name: true, email: true, dateOfBirth: true },
    });

    res.json({
      success: true,
      message: 'Date of birth updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating date of birth:', error);
    res.status(500).json({ message: 'Error updating date of birth' });
  }
});

// POST /api/birthday/send-wish - Send birthday wish email
router.post('/send-wish', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true, dateOfBirth: true },
    });

    if (!user || !user.dateOfBirth) {
      return res.status(400).json({ message: 'Date of birth not set' });
    }

    const today = new Date();
    const birthday = new Date(user.dateOfBirth);
    const isBirthdayToday =
      today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth();

    if (!isBirthdayToday) {
      return res.status(400).json({ message: 'Today is not your birthday' });
    }

    // Send birthday wish email
    const { sendEmail } = require('../lib/email');
    await sendEmail({
      to: user.email,
      subject: '🎉 Chúc mừng sinh nhật từ TravelGo!',
      html: `
        <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px;">
          <h1 style="font-size: 36px; margin-bottom: 20px;">🎉 Chúc mừng sinh nhật ${user.name}!</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">TravelGo chúc bạn một ngày sinh nhật thật vui vẻ và hạnh phúc!</p>
          <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin-top: 30px;">
            <h2 style="color: #667eea; margin-bottom: 20px;">🎁 Quà tặng đặc biệt</h2>
            <p style="font-size: 24px; font-weight: bold; color: #667eea;">Giảm 15% cho tất cả tour</p>
            <p style="margin-top: 15px;">Áp dụng trong 7 ngày từ hôm nay</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/tours" 
               style="display: inline-block; margin-top: 20px; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 10px; font-weight: bold;">
              Xem các tour ngay
            </a>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: 'Birthday wish email sent',
    });
  } catch (error) {
    console.error('Error sending birthday wish:', error);
    res.status(500).json({ message: 'Error sending birthday wish' });
  }
});

module.exports = router;

