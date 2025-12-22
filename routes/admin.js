// routes/admin.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/admin/summary - Enhanced with more stats
router.get('/summary', async (req, res) => {
  try {
    const period = req.query.period || '7days'; // 7days, 30days, 3months
    let startDate = new Date();
    
    // Calculate start date based on period
    if (period === '7days') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30days') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '3months') {
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    }

    const [
      totalUsers,
      totalDestinations,
      totalBookings,
      paymentsSuccess,
      pendingBookings,
      todayBookings,
      recentReviews,
      featuredDestinations,
      periodBookings,
      completedBookings,
      cancelledBookings,
      reviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.destination.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.review.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.destination.count({ where: { featured: true } }),
      // Period-specific bookings for metrics
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          status: 'CANCELLED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.review.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: { rating: true }
      })
    ]);

    // Calculate performance metrics
    const completionRate = periodBookings > 0 
      ? Math.round((completedBookings / periodBookings) * 100) 
      : 0;
    const cancellationRate = periodBookings > 0 
      ? Math.round((cancelledBookings / periodBookings) * 100) 
      : 0;
    const averageRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
      : 0;
    const ratingPercentage = (averageRating / 5) * 100;

    // Get recent bookings for alerts
    const recentPendingBookings = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } }, destination: { select: { name: true } } }
    });

    res.json({
      revenue: paymentsSuccess._sum.amount || 0,
      totalBookings,
      totalUsers,
      totalDestinations,
      pendingBookings,
      todayBookings,
      recentReviews,
      featuredDestinations,
      performance: {
        completionRate,
        cancellationRate,
        averageRating,
        ratingPercentage
      },
      alerts: {
        pendingBookings: recentPendingBookings.length,
        recentBookings: recentPendingBookings.slice(0, 3).map(b => ({
          id: b.id,
          user: b.user?.email,
          destination: b.destination?.name,
          createdAt: b.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    res.status(500).json({ message: 'Error fetching summary' });
  }
});

// GET/DELETE /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        loyalty: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// PUT /api/admin/users/:id - update user (including role, loyalty rank)
router.put('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role, name, email, avatarUrl, active, loyaltyRank, loyaltyPoints } = req.body;
    
    console.log('📝 PUT /api/admin/users/:id - Request:', { id, body: req.body });
    
    const updateData = {};
    if (role !== undefined) {
      updateData.role = role;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }
    // Toggle active flag stored inside settings JSON (no DB migration needed)
    if (active !== undefined) {
      const user = await prisma.user.findUnique({ where: { id }, select: { settings: true } });
      const currentSettings = user?.settings || {};
      updateData.settings = { ...currentSettings, active: !!active };
    }
    
    if (Object.keys(updateData).length === 0 && loyaltyRank === undefined && loyaltyPoints === undefined) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { loyalty: true },
    });
    
    // Format response
    const response = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatarUrl: updated.avatarUrl,
      createdAt: updated.createdAt,
      settings: updated.settings,
      loyalty: updated.loyalty,
    };

    // Update loyalty rank/points if provided
    if (loyaltyRank !== undefined || loyaltyPoints !== undefined) {
      console.log('🔄 Updating loyalty:', { userId: id, loyaltyRank, loyaltyPoints });
      
      const loyaltyData = {};
      if (loyaltyPoints !== undefined) {
        loyaltyData.points = Number(loyaltyPoints) || 0;
        console.log('📊 Setting loyalty points:', loyaltyData.points);
      }
      
      // Store rank in settings (Loyalty model only has points field)
      if (loyaltyRank !== undefined) {
        const currentSettings = updated.settings || {};
        const newSettings = { ...currentSettings, loyaltyRank: loyaltyRank };
        console.log('👑 Setting loyalty rank:', loyaltyRank);
        await prisma.user.update({
          where: { id },
          data: { settings: newSettings },
        });
        updated.settings = newSettings;
      }

      // Upsert loyalty record
      console.log('💾 Upserting loyalty:', loyaltyData);
      await prisma.loyalty.upsert({
        where: { userId: id },
        update: loyaltyData,
        create: { userId: id, ...loyaltyData },
      });

      // Reload loyalty
      const loyalty = await prisma.loyalty.findUnique({ where: { userId: id } });
      response.loyalty = loyalty;
      // Update settings in response
      const reloaded = await prisma.user.findUnique({ where: { id }, select: { settings: true } });
      if (reloaded) response.settings = reloaded.settings;
      
      console.log('✅ Loyalty updated:', { userId: id, rank: loyaltyRank, points: loyaltyPoints, loyalty });
    }
    
    console.log('✅ User updated successfully:', { id, response });
    res.json(response);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Error updating user', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // First, handle referrals - set referredById to null for users referred by this user
    try {
      await prisma.user.updateMany({
        where: { referredById: id },
        data: { referredById: null }
      });
    } catch (refError) {
      // If referredById column doesn't exist, skip this step
      if (!refError.message.includes('referredById')) {
        console.warn('Warning: Could not update referrals:', refError.message);
      }
    }
    
    // Delete the user
    await prisma.user.delete({ where: { id } });
    
    console.log('✅ User deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    
    // If error is about missing column, provide more helpful message
    if (error.code === 'P2022' && error.meta?.column?.includes('referredById')) {
      res.status(500).json({ 
        message: 'Database schema mismatch: referredById column missing. Please run migrations.',
        error: 'SCHEMA_MISMATCH'
      });
    } else {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
});

// Helpers for paging/sorting
function parsePagingSort(req, map = {}) {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  const sortBy = (req.query.sortBy || 'createdAt').toString();
  const order = (req.query.order || 'desc').toString().toLowerCase() === 'asc' ? 'asc' : 'desc';
  const orderBy = map[sortBy] || { [sortBy]: order };
  return { page, pageSize, orderBy };
}

// GET /api/admin/bookings?page=&pageSize=&sortBy=createdAt|status&order=asc|desc
router.get('/bookings', async (req, res) => {
  const { page, pageSize, orderBy } = parsePagingSort(req, { createdAt: { createdAt: 'desc' } });
  const total = await prisma.booking.count();
  const items = await prisma.booking.findMany({
    orderBy,
    include: { 
      user: { 
        select: { 
          id: true, 
          email: true, 
          name: true, 
          avatarUrl: true,
          role: true 
        } 
      }, 
      destination: true, 
      payment: true 
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
});

// PUT /api/admin/bookings/:id - update booking status
router.put('/bookings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update booking - use select to avoid emailVerified field
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        code: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
          }
        },
        destination: true,
        payment: true,
      },
    });
    
    console.log('✅ Booking status updated successfully:', { id, status });
    
    // Gửi email thông báo cập nhật trạng thái (không block response nếu email fail)
    if (updated.user && updated.destination) {
      const { sendBookingStatusUpdateEmail } = require('../lib/email');
      sendBookingStatusUpdateEmail(updated, updated.user, updated.destination, status).catch(err => {
        console.error('❌ Failed to send booking status update email:', err);
      });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

// DELETE /api/admin/bookings?id=xxx
router.delete('/bookings', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ message: 'Booking ID required' });
  }
  try {
    await prisma.booking.delete({ where: { id: String(id) } });
    
    console.log('✅ Booking deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

// GET /api/admin/reviews?page=&pageSize=&sortBy=createdAt|rating&order=asc|desc
router.get('/reviews', async (req, res) => {
  const { page, pageSize, orderBy } = parsePagingSort(req);
  const total = await prisma.review.count();
  const items = await prisma.review.findMany({
    orderBy,
    select: {
      id: true,
      rating: true,
      comment: true,
      images: true,
      approved: true,
      helpfulCount: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
        }
      },
      destination: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
});

// DELETE /api/admin/reviews?id=xxx
router.delete('/reviews', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ message: 'Review ID required' });
  }
  try {
    const reviewId = Number(id);
    await prisma.review.delete({ where: { id: reviewId } });
    
    console.log('✅ Review deleted successfully:', { id: reviewId });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// GET /api/admin/destinations - list all destinations for admin
router.get('/destinations', async (req, res) => {
  const { page, pageSize, orderBy } = parsePagingSort(req);
  const total = await prisma.destination.count();
  const items = await prisma.destination.findMany({
    orderBy,
    include: { category: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
});

// POST /api/admin/destinations - create destination
router.post('/destinations', async (req, res) => {
  try {
    const destination = await prisma.destination.create({
      data: req.body,
      include: { category: true }
    });
    res.status(201).json(destination);
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ message: 'Error creating destination' });
  }
});

// PUT /api/admin/destinations/:slug - update destination
router.put('/destinations/:slug', async (req, res) => {
  try {
    const destination = await prisma.destination.update({
      where: { slug: req.params.slug },
      data: req.body,
      include: { category: true }
    });
    res.json(destination);
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({ message: 'Error updating destination' });
  }
});

// DELETE /api/admin/destinations/:slug - delete destination
router.delete('/destinations/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    await prisma.destination.delete({ where: { slug } });
    
    console.log('✅ Destination deleted successfully:', { slug });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting destination:', error);
    res.status(500).json({ message: 'Error deleting destination' });
  }
});

// GET /api/admin/payments?page=&pageSize=&sortBy=createdAt|amount|status&order=asc|desc
router.get('/payments', async (req, res) => {
  const { page, pageSize, orderBy } = parsePagingSort(req);
  const total = await prisma.payment.count();
  const items = await prisma.payment.findMany({
    orderBy,
    include: { 
      booking: { 
        include: { 
          user: { 
            select: { 
              id: true, 
              email: true, 
              name: true, 
              avatarUrl: true,
              role: true 
            } 
          }, 
          destination: true 
        } 
      } 
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
});

// PUT /api/admin/payments/:id - update payment status
router.put('/payments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update payment status - use select to avoid emailVerified field
    const updated = await prisma.payment.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        bookingId: true,
        amount: true,
        status: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        booking: {
          select: {
            id: true,
            code: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
              }
            },
            destination: true,
          }
        },
      },
    });
    
    // If payment is successful, update booking status to CONFIRMED
    if (status === 'SUCCESS' && updated.booking.status === 'PENDING') {
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: { status: 'CONFIRMED' },
      });
      console.log('✅ Booking status updated to CONFIRMED:', { bookingId: updated.bookingId });
    }
    
    // Gửi email biên lai khi thanh toán thành công
    if (status === 'SUCCESS' && updated.booking?.user && updated.booking?.destination) {
      const { sendPaymentReceiptEmail } = require('../lib/email');
      sendPaymentReceiptEmail(updated, updated.booking, updated.booking.user, updated.booking.destination).catch(err => {
        console.error('❌ Failed to send payment receipt email:', err);
      });
    }
    
    console.log('✅ Payment status updated successfully:', { id, status });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

// Admin settings stub
router.get('/settings', (req, res) => {
  res.json({ currency: 'VND', locale: 'vi-VN' });
});

// GET /api/admin/chat - get all chat messages for admin
router.get('/chat', async (req, res) => {
  try {
    // For now, return empty array since we don't have ChatMessage model yet
    // In production: const messages = await prisma.chatMessage.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    res.json({ messages: [] });
  } catch (error) {
    console.error('Error fetching admin chat:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// DELETE /api/admin/chat/:id - delete chat message
router.delete('/chat/:id', async (req, res) => {
  try {
    // In production: await prisma.chatMessage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ message: 'Error deleting chat message' });
  }
});

module.exports = router;