// lib/scheduler.js - Scheduled tasks for email reminders
const prisma = require('./prisma');
const { sendBookingReminderEmail, sendPaymentReminderEmail } = require('./email');

/**
 * Send booking reminders (1 day before departure)
 */
async function sendBookingReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Note: Booking model (for destinations) doesn't have a departure date field
    // Only BookingTour has a date field, so we only query tour bookings
    // Use select instead of include to avoid fields that might not exist in DB
    let tourBookings = [];
    try {
      tourBookings = await prisma.bookingTour.findMany({
        where: {
          status: 'CONFIRMED',
          date: {
            gte: tomorrow,
            lt: dayAfter,
          },
        },
        select: {
          id: true,
          code: true,
          status: true,
          date: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          tour: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    } catch (dbError) {
      // If database schema doesn't match (e.g., missing adults/children columns), skip
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  BookingTour schema mismatch. Run: npx prisma db push or npx prisma migrate dev');
        return;
      }
      throw dbError;
    }

    // Send reminders for tour bookings
    for (const booking of tourBookings) {
      if (booking.user && booking.tour) {
        sendBookingReminderEmail(booking, booking.user, { name: booking.tour.name }).catch(err => {
          console.error(`❌ Failed to send tour booking reminder for booking ${booking.id}:`, err);
        });
      }
    }

    console.log(`✅ Sent ${tourBookings.length} booking reminders`);
  } catch (error) {
    console.error('❌ Error sending booking reminders:', error);
  }
}

/**
 * Send payment reminders (for pending bookings older than 24 hours)
 */
async function sendPaymentReminders() {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Find pending bookings older than 24 hours
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneDayAgo,
        },
        payment: {
          status: 'PENDING',
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        destination: {
          select: { id: true, name: true, slug: true },
        },
        payment: true,
      },
    });

    // Use select instead of include to avoid fields that might not exist in DB
    let tourBookings = [];
    try {
      tourBookings = await prisma.bookingTour.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: oneDayAgo,
          },
          payment: {
            status: 'PENDING',
          },
        },
        select: {
          id: true,
          code: true,
          status: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          tour: {
            select: { id: true, name: true, slug: true },
          },
          payment: {
            select: { id: true, status: true },
          },
        },
      });
    } catch (dbError) {
      // If database schema doesn't match (e.g., missing adults/children columns), skip
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  BookingTour schema mismatch. Run: npx prisma db push or npx prisma migrate dev');
        tourBookings = []; // Continue with empty array
      } else {
        throw dbError;
      }
    }

    // Send reminders
    for (const booking of bookings) {
      if (booking.user && booking.destination && booking.payment?.status === 'PENDING') {
        sendPaymentReminderEmail(booking, booking.user, booking.destination).catch(err => {
          console.error(`❌ Failed to send payment reminder for booking ${booking.id}:`, err);
        });
      }
    }

    for (const booking of tourBookings) {
      if (booking.user && booking.tour && booking.payment?.status === 'PENDING') {
        sendPaymentReminderEmail(booking, booking.user, { name: booking.tour.name }).catch(err => {
          console.error(`❌ Failed to send tour payment reminder for booking ${booking.id}:`, err);
        });
      }
    }

    console.log(`✅ Sent ${bookings.length + tourBookings.length} payment reminders`);
  } catch (error) {
    console.error('❌ Error sending payment reminders:', error);
  }
}

/**
 * Send birthday discount notifications
 */
async function sendBirthdayNotifications() {
  try {
    // Check if dateOfBirth field exists in the database
    // If the Prisma client hasn't been regenerated or migration not run, skip this
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Try to find users with birthday tomorrow
    // Use a raw query or check if field exists first
    let users = [];
    try {
      users = await prisma.user.findMany({
        where: {
          dateOfBirth: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
        },
      });
    } catch (fieldError) {
      // If dateOfBirth field doesn't exist in database, skip birthday notifications
      if (fieldError.message && fieldError.message.includes('dateOfBirth')) {
        console.log('⚠️  dateOfBirth field not available. Skipping birthday notifications. Run: npx prisma db push or npx prisma migrate dev');
        return;
      }
      throw fieldError;
    }

    for (const user of users) {
      if (!user.dateOfBirth) continue;

      const birthday = new Date(user.dateOfBirth);
      const isBirthdayTomorrow =
        tomorrow.getDate() === birthday.getDate() && tomorrow.getMonth() === birthday.getMonth();

      if (isBirthdayTomorrow) {
        const { sendEmail } = require('./email');
        sendEmail({
          to: user.email,
          subject: '🎉 Sinh nhật của bạn sắp đến! Nhận ngay ưu đãi đặc biệt',
          html: `
            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px;">
              <h1 style="font-size: 36px; margin-bottom: 20px;">🎉 Chúc mừng sinh nhật ${user.name}!</h1>
              <p style="font-size: 18px; margin-bottom: 30px;">Ngày mai là sinh nhật của bạn! TravelGo dành tặng bạn ưu đãi đặc biệt:</p>
              <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin-top: 30px;">
                <h2 style="color: #667eea; margin-bottom: 20px;">🎁 Quà tặng sinh nhật</h2>
                <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0;">Giảm 15%</p>
                <p style="margin-top: 15px;">Cho tất cả tour trong 7 ngày</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/tours" 
                   style="display: inline-block; margin-top: 20px; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 10px; font-weight: bold;">
                  Xem các tour ngay
                </a>
              </div>
            </div>
          `,
        }).catch(err => {
          console.error(`❌ Failed to send birthday notification to ${user.email}:`, err);
        });
      }
    }

    console.log(`✅ Checked ${users.length} users for birthday notifications`);
  } catch (error) {
    console.error('❌ Error sending birthday notifications:', error);
  }
}

/**
 * Initialize scheduler (run every hour)
 */
function initScheduler() {
  // Run immediately on startup
  sendBookingReminders();
  sendPaymentReminders();
  sendBirthdayNotifications();

  // Then run every hour
  setInterval(() => {
    sendBookingReminders();
    sendPaymentReminders();
  }, 60 * 60 * 1000); // 1 hour

  // Run birthday check once per day at 9 AM
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setHours(9, 0, 0, 0);
  if (next9AM <= now) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  const msUntil9AM = next9AM - now;

  setTimeout(() => {
    sendBirthdayNotifications();
    // Then run daily
    setInterval(sendBirthdayNotifications, 24 * 60 * 60 * 1000);
  }, msUntil9AM);

  console.log('✅ Scheduler initialized - Running reminders every hour, birthday check daily at 9 AM');
}

module.exports = {
  sendBookingReminders,
  sendPaymentReminders,
  sendBirthdayNotifications,
  initScheduler,
};

