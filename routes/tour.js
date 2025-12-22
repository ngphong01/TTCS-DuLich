const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const slugify = require('slugify');
const cacheResponse = require('../middleware/cache');
const { invalidatePattern } = require('../lib/redis');

// GET /api/tour - list with filters & pagination
router.get(
  '/',
  cacheResponse({
    keyPrefix: 'tours:list',
    keyBuilder: (req) => `tours:list:${req.query.lang || 'en'}:${JSON.stringify(req.query)}`,
    ttl: Number(process.env.CACHE_TTL_SECONDS || 300),
  }),
  async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    const skip = (page - 1) * limit;
    const { q, destinationId, minPrice, maxPrice, tag, lang } = req.query;
    
    // 🔥 CRITICAL: Log lang parameter để debug
    if (lang) {
      console.log(`🌐 Tour API - Language requested: ${lang}`);
    }

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (destinationId) where.destinationId = Number(destinationId);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (tag) where.tags = { array_contains: tag };

    const [items, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, name: true, slug: true, image: true, price: true, rating: true, reviewCount: true,
          destinationId: true, shortDescription: true, duration: true, tags: true,
        },
      }),
      prisma.tour.count({ where }),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Error fetching tours' });
  }
  }
);

// GET /api/tour/:slug - detail
router.get(
  '/:slug',
  cacheResponse({
    keyPrefix: 'tours:slug',
    keyBuilder: (req) => `tours:slug:${req.params.slug}:${req.query.lang || 'en'}`,
    ttl: Number(process.env.CACHE_TTL_SECONDS || 600),
  }),
  async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    
    // 🔥 CRITICAL: Log lang parameter để debug
    console.log(`🌐 Tour Detail API - Language requested: ${lang} for slug: ${req.params.slug}`);
    
    const tour = await prisma.tour.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true, name: true, slug: true, image: true, photos: true, price: true, originalPrice: true,
        rating: true, reviewCount: true, description: true, shortDescription: true, duration: true,
        tags: true, highlights: true, itinerary: true, map: true, faq: true, policies: true,
        transport: true, destinationId: true, createdAt: true, updatedAt: true,
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            image: true,
          },
        },
      },
    });
    
    if (!tour) {
      console.log(`❌ Tour not found with slug: ${req.params.slug}`);
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    console.log(`✅ Tour found: ${tour.name} (ID: ${tour.id})`);
    res.json(tour);
  } catch (error) {
    console.error('❌ Error fetching tour:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    res.status(500).json({ 
      message: 'Error fetching tour',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  }
);

// Admin create/update (simple)
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    const slug = data.slug || slugify(data.name || '', { lower: true, strict: true });
    const created = await prisma.tour.create({ data: { ...data, slug } });
    await invalidatePattern('tours:*');
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Error creating tour' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.tour.update({ where: { id }, data: req.body });
    await invalidatePattern('tours:*');
    res.json(updated);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Error updating tour' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Check if tour has bookings
    const bookings = await prisma.bookingTour.findMany({
      where: { tourId: id },
      take: 1,
    });
    
    if (bookings.length > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa tour này vì đã có đặt chỗ. Vui lòng xóa các đặt chỗ trước.' 
      });
    }
    
    await prisma.tour.delete({ where: { id } });
    await invalidatePattern('tours:*');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error);
    if (error.code === 'P2003') {
      res.status(400).json({ 
        message: 'Không thể xóa tour này vì có dữ liệu liên quan (đặt chỗ, đánh giá, v.v.)' 
      });
    } else {
      res.status(500).json({ message: 'Error deleting tour' });
    }
  }
});

// POST /api/tour/:tourId/review - Create tour review
router.post('/:tourId/review', require('../middleware/rateLimit').reviewLimiter, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const { rating, comment } = req.body;

    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }

    const tour = await prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Get userId from auth token
    let userId = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify user has completed booking for this tour
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });
    if (user && !user.email.startsWith('guest-')) {
      const hasCompletedBooking = await prisma.bookingTour.findFirst({
        where: {
          userId,
          tourId,
          status: 'COMPLETED',
        },
      });

      if (!hasCompletedBooking) {
        console.warn(`⚠️ User ${userId} reviewing tour ${tourId} without completed booking`);
        // Optionally return error for strict verification:
        // return res.status(403).json({ message: 'You must complete a booking before reviewing this tour' });
      }
    }

    const review = await prisma.tourReview.create({
      data: {
        tourId,
        userId,
        rating: Number(rating),
        comment,
        approved: false, // Requires admin approval
      },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });

    // Update tour rating
    const allReviews = await prisma.tourReview.findMany({
      where: { tourId, approved: true },
      select: { rating: true },
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.tour.update({
      where: { id: tourId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    await invalidatePattern(`tours:reviews:${tourId}`);
    if (tour?.slug) {
      await invalidatePattern(`tours:slug:${tour.slug}`);
    }
    await invalidatePattern('tours:list*');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating tour review:', error);
    res.status(500).json({ message: 'Error creating tour review' });
  }
});

// GET /api/tour/:tourId/reviews - Get tour reviews
router.get(
  '/:tourId/reviews',
  cacheResponse({
    keyPrefix: 'tours:reviews',
    keyBuilder: (req) => `tours:reviews:${req.params.tourId}`,
    ttl: Number(process.env.CACHE_TTL_SECONDS || 300),
  }),
  async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const reviews = await prisma.tourReview.findMany({
        where: { tourId, approved: true },
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching tour reviews:', error);
      res.status(500).json({ message: 'Error fetching tour reviews' });
    }
  }
);

// PUT /api/tour/review/:id/approve - Approve/reject tour review (Admin only)
router.put('/review/:id/approve', require('../middleware/auth').authRequired, require('../middleware/auth').isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const review = await prisma.tourReview.update({
      where: { id: parseInt(id) },
      data: { approved: approved === true },
      include: { user: { select: { name: true } }, tour: { select: { name: true } } },
    });

    // Recalculate tour rating after approval change
    const allReviews = await prisma.tourReview.findMany({
      where: { tourId: review.tourId, approved: true },
      select: { rating: true },
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.tour.update({
      where: { id: review.tourId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    await invalidatePattern(`tours:reviews:${review.tourId}`);
    await invalidatePattern('tours:list*');

    res.json(review);
  } catch (error) {
    console.error('Error approving tour review:', error);
    res.status(500).json({ message: 'Lỗi duyệt review' });
  }
});

module.exports = router;


