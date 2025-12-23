const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const slugify = require('slugify');
const cacheResponse = require('../middleware/cache');
const { invalidatePattern } = require('../lib/redis');

// Helper: Normalize Vietnamese text (remove diacritics)
const normalizeVietnamese = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// GET /api/tour - list with filters & pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Parse query params
    let q = req.query.q;
    const destinationId = req.query.destinationId;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const tag = req.query.tag;
    const transport = req.query.transport;
    const departurePoint = req.query.departurePoint;

    // Clean search query
    if (q && typeof q === 'string') {
      q = decodeURIComponent(q.replace(/\+/g, ' ')).trim();
      if (q.length === 0) q = null;
    } else {
      q = null;
    }

    console.log('\n========== TOUR API ==========');
    console.log('Query:', { q, destinationId, minPrice, maxPrice, tag, transport, departurePoint });
    console.log('Pagination:', { page, limit, skip });

    // Build where conditions
    const whereConditions = [];

    // Price filter
    if (minPrice || maxPrice) {
      const priceCondition = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) priceCondition.gte = min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) priceCondition.lte = max;
      }
      if (Object.keys(priceCondition).length > 0) {
        whereConditions.push({ price: priceCondition });
      }
    }

    // Destination filter
    if (destinationId) {
      const destId = parseInt(destinationId);
      if (!isNaN(destId)) {
        whereConditions.push({ destinationId: destId });
      }
    }

    // Tag filter
    if (tag && typeof tag === 'string' && tag.trim()) {
      whereConditions.push({
        tags: { contains: tag.trim(), mode: 'insensitive' },
      });
    }

    // Transport filter
    if (transport && typeof transport === 'string' && transport.trim()) {
      whereConditions.push({
        transport: { contains: transport.trim(), mode: 'insensitive' },
      });
    }

    // Departure point filter
    if (departurePoint && typeof departurePoint === 'string' && departurePoint.trim()) {
      const pointKeywords = {
        hanoi: ['hà nội', 'hanoi'],
        hochiminh: ['hồ chí minh', 'hcm', 'sài gòn', 'saigon'],
        danang: ['đà nẵng', 'danang'],
      };
      const keywords = pointKeywords[departurePoint.toLowerCase()] || [departurePoint];
      whereConditions.push({
        OR: keywords.map((kw) => ({
          departurePoint: { contains: kw, mode: 'insensitive' },
        })),
      });
    }

    // Build final where clause (without search - will filter later)
    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // If there's a search query, we need to filter manually for Vietnamese
    if (q) {
      console.log(`Searching for: "${q}"`);
      const normalizedQuery = normalizeVietnamese(q);
      console.log(`Normalized query: "${normalizedQuery}"`);

      // Get all destinations to match by name
      const destinations = await prisma.destination.findMany({
        select: { id: true, name: true },
      });

      const matchingDestIds = destinations
        .filter((d) => normalizeVietnamese(d.name).includes(normalizedQuery))
        .map((d) => d.id);

      console.log(`Matching destination IDs: [${matchingDestIds.join(', ')}]`);

      // Get all tours (with other filters applied)
      const allTours = await prisma.tour.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          price: true,
          originalPrice: true,
          rating: true,
          reviewCount: true,
          destinationId: true,
          shortDescription: true,
          description: true,
          duration: true,
          tags: true,
          transport: true,
          destination: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`Total tours before search filter: ${allTours.length}`);

      // Filter by search query
      const filteredTours = allTours.filter((tour) => {
        const nameMatch = tour.name ? normalizeVietnamese(tour.name).includes(normalizedQuery) : false;
        const shortDescMatch = tour.shortDescription ? normalizeVietnamese(tour.shortDescription).includes(normalizedQuery) : false;
        const descMatch = tour.description ? normalizeVietnamese(tour.description).includes(normalizedQuery) : false;
        const destMatch = tour.destinationId ? matchingDestIds.includes(tour.destinationId) : false;
        const destNameMatch = tour.destination?.name ? normalizeVietnamese(tour.destination.name).includes(normalizedQuery) : false;

        return nameMatch || shortDescMatch || descMatch || destMatch || destNameMatch;
      });

      console.log(`Filtered tours: ${filteredTours.length}`);

      // Paginate
      const total = filteredTours.length;
      const paginatedTours = filteredTours.slice(skip, skip + limit);

      console.log(`Returning ${paginatedTours.length} tours (page ${page}/${Math.ceil(total / limit)})`);

      return res.json({
        items: paginatedTours,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    }

    // No search query - use Prisma directly
    const [items, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          price: true,
          originalPrice: true,
          rating: true,
          reviewCount: true,
          destinationId: true,
          shortDescription: true,
          duration: true,
          tags: true,
          transport: true,
          destination: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.tour.count({ where }),
    ]);

    console.log(`Found ${total} tours (showing ${items.length})`);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ Error in GET /api/tour:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      message: 'Error fetching tours',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/tour/by-id/:id
router.get('/by-id/:id', async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);

    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        destination: {
          select: { id: true, name: true, slug: true, country: true, image: true },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour by ID:', error);
    res.status(500).json({ message: 'Error fetching tour' });
  }
});

// GET /api/tour/:slug
router.get('/:slug', async (req, res) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { slug: req.params.slug },
      include: {
        destination: {
          select: { id: true, name: true, slug: true, country: true, image: true },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ message: 'Error fetching tour' });
  }
});

// Admin routes
const { authRequired, isAdmin } = require('../middleware/auth');

router.post('/', authRequired, isAdmin, async (req, res) => {
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

router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.tour.update({ where: { id }, data: req.body });
    await invalidatePattern('tours:*');
    res.json(updated);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ message: 'Error updating tour' });
  }
});

router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const bookings = await prisma.bookingTour.findMany({
      where: { tourId: id },
      take: 1,
    });

    if (bookings.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa tour đã có đặt chỗ' });
    }

    await prisma.tour.delete({ where: { id } });
    await invalidatePattern('tours:*');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Error deleting tour' });
  }
});

// Review routes
router.post('/:tourId/review', async (req, res) => {
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

    // Get userId from token
    let userId = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } catch {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const review = await prisma.tourReview.create({
      data: { tourId, userId, rating: Number(rating), comment, approved: false },
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
      data: { rating: avgRating, reviewCount: allReviews.length },
    });

    await invalidatePattern('tours:*');
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

router.get('/:tourId/reviews', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const reviews = await prisma.tourReview.findMany({
      where: { tourId, approved: true },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.put('/review/:id/approve', authRequired, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { approved } = req.body;

    const review = await prisma.tourReview.update({
      where: { id },
      data: { approved: approved === true },
      include: { user: { select: { name: true } }, tour: { select: { name: true } } },
    });

    // Recalculate rating
    const allReviews = await prisma.tourReview.findMany({
      where: { tourId: review.tourId, approved: true },
      select: { rating: true },
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.tour.update({
      where: { id: review.tourId },
      data: { rating: avgRating, reviewCount: allReviews.length },
    });

    await invalidatePattern('tours:*');
    res.json(review);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Error approving review' });
  }
});

module.exports = router;