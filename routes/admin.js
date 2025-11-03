// routes/admin.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/admin/summary - Enhanced with more stats
router.get('/summary', async (req, res) => {
  try {
    const [
      totalUsers,
      totalDestinations,
      totalBookings,
      paymentsSuccess,
      pendingBookings,
      todayBookings,
      recentReviews,
      featuredDestinations
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
    ]);

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
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    
    console.log('✅ User deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
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
    include: { user: true, destination: true, payment: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
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
    include: { user: true, destination: true },
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
    include: { booking: { include: { user: true, destination: true } } },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  res.json({ items, total, page, pageSize });
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