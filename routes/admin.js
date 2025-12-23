// routes/admin.js
const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
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

// GET /api/admin/analytics - Get detailed analytics data for charts
router.get('/analytics', authRequired, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || '30days'; // 7days, 30days, 3months, 1year
    let startDate = new Date();
    let days = 30;
    
    if (period === '7days') {
      days = 7;
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30days') {
      days = 30;
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '3months') {
      days = 90;
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === '1year') {
      days = 365;
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    // Get revenue by day
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate }
      },
      select: {
        amount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get bookings by day
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get users by day
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group data by day
    const revenueByDay = {};
    const bookingsByDay = {};
    const usersByDay = {};
    const bookingsByStatus = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };

    payments.forEach(payment => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + (payment.amount || 0);
    });

    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      bookingsByDay[date] = (bookingsByDay[date] || 0) + 1;
      bookingsByStatus[booking.status] = (bookingsByStatus[booking.status] || 0) + 1;
    });

    users.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      usersByDay[date] = (usersByDay[date] || 0) + 1;
    });

    // Create time series data
    const timeSeries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      timeSeries.push({
        date: dateStr,
        dateLabel: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        revenue: revenueByDay[dateStr] || 0,
        bookings: bookingsByDay[dateStr] || 0,
        users: usersByDay[dateStr] || 0
      });
    }

    // Get top destinations
    const topDestinations = await prisma.booking.groupBy({
      by: ['destinationId'],
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const destinationIds = topDestinations.map(d => d.destinationId);
    const destinations = await prisma.destination.findMany({
      where: { id: { in: destinationIds } },
      select: { id: true, name: true }
    });

    const destinationMap = {};
    destinations.forEach(d => {
      destinationMap[d.id] = d.name;
    });

    const topDestinationsData = topDestinations.map(d => ({
      name: destinationMap[d.destinationId] || `Destination ${d.destinationId}`,
      bookings: d._count.id
    }));

    // Get revenue by month (for longer periods)
    const revenueByMonth = {};
    if (period === '1year' || period === '3months') {
      payments.forEach(payment => {
        const date = new Date(payment.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (payment.amount || 0);
      });
    }

    res.json({
      timeSeries,
      bookingsByStatus,
      topDestinations: topDestinationsData,
      revenueByMonth: Object.keys(revenueByMonth).map(key => ({
        month: key,
        revenue: revenueByMonth[key]
      })),
      summary: {
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalBookings: bookings.length,
        totalUsers: users.length,
        averageRevenuePerDay: timeSeries.reduce((sum, d) => sum + d.revenue, 0) / days
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// GET/DELETE /api/admin/users
router.get('/users', authRequired, isAdmin, async (req, res) => {
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
router.put('/users/:id', authRequired, isAdmin, async (req, res) => {
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

router.delete('/users/:id', authRequired, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const startTime = Date.now();
  
  console.log(`🗑️ Starting deletion process for user ${id}...`);
  
  // Sử dụng transaction để đảm bảo atomicity - rollback nếu có lỗi
  try {
    await prisma.$transaction(async (tx) => {
      // ============================================
      // STEP 1: Kiểm tra user tồn tại
      // ============================================
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }
      
      // ============================================
      // STEP 2: Xóa ChatMessage TRƯỚC ChatSession
      // Lý do: ChatMessage.sessionId là foreign key -> ChatSession.id
      // Phải xóa ChatMessage trước khi xóa ChatSession
      // ============================================
      console.log('📋 Step 1: Deleting ChatMessages...');
      const chatSessions = await tx.chatSession.findMany({
        where: { userId: id },
        select: { id: true }
      });
      const chatSessionIds = chatSessions.map(s => s.id);
      
      if (chatSessionIds.length > 0) {
        const deletedChatMessages = await tx.chatMessage.deleteMany({
          where: { sessionId: { in: chatSessionIds } }
        });
        console.log(`✅ Deleted ${deletedChatMessages.count} chat message(s)`);
      }
      
      // ============================================
      // STEP 3: Xóa Payment và PaymentTour TRƯỚC Booking/BookingTour
      // Lý do: Payment.bookingId và PaymentTour.bookingId là foreign keys
      // Phải xóa Payment/PaymentTour trước khi xóa Booking/BookingTour
      // ============================================
      console.log('📋 Step 2: Deleting Payments...');
      const [bookingIds, tourBookingIds] = await Promise.all([
        tx.booking.findMany({ where: { userId: id }, select: { id: true } }),
        tx.bookingTour.findMany({ where: { userId: id }, select: { id: true } })
      ]);
      
      const bookingIdList = bookingIds.map(b => b.id);
      const tourBookingIdList = tourBookingIds.map(b => b.id);
      
      // Xóa Payment và PaymentTour song song (không phụ thuộc nhau)
      const [deletedPayments, deletedPaymentTours] = await Promise.all([
        bookingIdList.length > 0 
          ? tx.payment.deleteMany({ where: { bookingId: { in: bookingIdList } } })
          : Promise.resolve({ count: 0 }),
        tourBookingIdList.length > 0
          ? tx.paymentTour.deleteMany({ where: { bookingId: { in: tourBookingIdList } } })
          : Promise.resolve({ count: 0 })
      ]);
      
      if (deletedPayments.count > 0) {
        console.log(`✅ Deleted ${deletedPayments.count} payment(s)`);
      }
      if (deletedPaymentTours.count > 0) {
        console.log(`✅ Deleted ${deletedPaymentTours.count} payment tour(s)`);
      }
      
      // ============================================
      // STEP 4: Xóa ChatSession (đã xóa ChatMessage rồi)
      // ============================================
      console.log('📋 Step 3: Deleting ChatSessions...');
      if (chatSessionIds.length > 0) {
        const deletedChatSessions = await tx.chatSession.deleteMany({
          where: { userId: id }
        });
        console.log(`✅ Deleted ${deletedChatSessions.count} chat session(s)`);
      }
      
      // ============================================
      // STEP 5: Xóa các bảng liên quan đến User (có thể song song)
      // Lý do: Các bảng này không phụ thuộc lẫn nhau, chỉ phụ thuộc User
      // Xóa tuần tự để tránh foreign key constraint issues
      // ====================================================
      console.log('📋 Step 4: Deleting all related data...');
      
      // Xóa Payment và PaymentTour trước (do foreign key với Booking/BookingTour)
      await tx.payment.deleteMany({ 
        where: { 
          booking: { userId: id } 
        } 
      }).catch(() => ({ count: 0 }));
      
      await tx.paymentTour.deleteMany({ 
        where: { 
          booking: { userId: id } 
        } 
      }).catch(() => ({ count: 0 }));
      
      // Sau đó xóa các records khác song song - wrap trong try-catch để handle gracefully
      const [
        deletedBookings,
        deletedTourBookings,
        deletedReviews,
        deletedTourReviews,
        deletedNotifications,
        deletedWishlist,
        deletedRefreshTokens,
        deletedReviewVotes,
        deletedTourReviewVotes,
        deletedPromoUsages,
        deletedActivityLogs,
        updatedReferrals,
        deletedLoyalty
      ] = await Promise.all([
        // Critical data - bookings và reviews
        tx.booking.deleteMany({ where: { userId: id } }).catch((e) => {
          console.warn('Warning deleting bookings:', e.message);
          return { count: 0 };
        }),
        tx.bookingTour.deleteMany({ where: { userId: id } }).catch((e) => {
          console.warn('Warning deleting tour bookings:', e.message);
          return { count: 0 };
        }),
        tx.review.deleteMany({ where: { userId: id } }).catch((e) => {
          console.warn('Warning deleting reviews:', e.message);
          return { count: 0 };
        }),
        tx.tourReview.deleteMany({ where: { userId: id } }).catch((e) => {
          console.warn('Warning deleting tour reviews:', e.message);
          return { count: 0 };
        }),
        // Non-critical data
        tx.notification.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.wishlist.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.refreshToken.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.reviewHelpfulVote.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.tourReviewHelpfulVote.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.promoCodeUsage.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        tx.activityLog.deleteMany({ where: { userId: id } }).catch(() => ({ count: 0 })),
        // Update referrals (set referredById = null)
        tx.user.updateMany({
          where: { referredById: id },
          data: { referredById: null }
        }).catch(() => ({ count: 0 })),
        // Delete loyalty (unique constraint) - handle case where it might not exist
        tx.loyalty.delete({ where: { userId: id } }).catch((e) => {
          // If loyalty doesn't exist (P2025), that's ok
          if (e.code === 'P2025') return null;
          throw e;
        })
      ]);
      
      // Log kết quả
      const results = {
        bookings: deletedBookings.count,
        tourBookings: deletedTourBookings.count,
        reviews: deletedReviews.count,
        tourReviews: deletedTourReviews.count,
        notifications: deletedNotifications.count,
        wishlist: deletedWishlist.count,
        refreshTokens: deletedRefreshTokens.count,
        reviewVotes: deletedReviewVotes.count,
        tourReviewVotes: deletedTourReviewVotes.count,
        promoUsages: deletedPromoUsages.count,
        activityLogs: deletedActivityLogs.count,
        referrals: updatedReferrals.count,
        loyalty: deletedLoyalty !== null ? 1 : 0
      };
      
      console.log('✅ Deletion results:', results);
      
      // ============================================
      // STEP 6: Cuối cùng mới xóa User
      // Lý do: Phải xóa tất cả dữ liệu liên quan trước
      // ============================================
      console.log('📋 Step 5: Deleting user...');
      await tx.user.delete({ where: { id } });
      console.log(`✅ User ${id} deleted successfully`);
    });
    
    const deleteTime = Date.now() - startTime;
    console.log(`⚡ Total deletion time: ${deleteTime}ms`);
    
    res.status(204).send();
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    console.error('❌ Error details:', {
      code: error.code,
      meta: error.meta,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific errors
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'NOT_FOUND'
      });
    }
    
    // Handle Prisma errors
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'unknown';
      const modelName = error.meta?.model_name || 'unknown';
      console.error(`❌ Foreign key constraint violation: ${modelName}.${fieldName}`);
      
      return res.status(400).json({ 
        message: `Không thể xóa user này vì có dữ liệu liên quan trong bảng ${modelName} (field: ${fieldName}). Vui lòng kiểm tra lại.`,
        error: 'FOREIGN_KEY_CONSTRAINT',
        field: fieldName,
        model: modelName
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'NOT_FOUND'
      });
    }
    
    // Generic error - trả về message chi tiết hơn
    const statusCode = error.code === 'P2003' ? 400 : 500;
    res.status(statusCode).json({ 
      message: error.message || 'Error deleting user', 
      error: error.message,
      code: error.code,
      meta: error.meta
    });
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
router.get('/bookings', authRequired, isAdmin, async (req, res) => {
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
router.put('/bookings/:id', authRequired, isAdmin, async (req, res) => {
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
router.delete('/bookings', authRequired, isAdmin, async (req, res) => {
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
router.get('/reviews', authRequired, isAdmin, async (req, res) => {
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
router.delete('/reviews', authRequired, isAdmin, async (req, res) => {
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
router.get('/destinations', authRequired, isAdmin, async (req, res) => {
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
router.post('/destinations', authRequired, isAdmin, async (req, res) => {
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
router.put('/destinations/:slug', authRequired, isAdmin, async (req, res) => {
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
router.delete('/destinations/:slug', authRequired, isAdmin, async (req, res) => {
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
router.get('/payments', authRequired, isAdmin, async (req, res) => {
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
router.put('/payments/:id', authRequired, isAdmin, async (req, res) => {
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