// routes/destination.js
const express = require('express');
const prisma = require('../lib/prisma');
const cacheResponse = require('../middleware/cache');
const { invalidatePattern } = require('../lib/redis');
const { authRequired, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/destination
// Supports pagination, multi-category filter, price range, search, country filter and sort
// ?page=1&pageSize=10&categoryId=1&categoryIds=1,2&q=beach&minPrice=0&maxPrice=10000000&country=vietnam|international&sort=name_asc|name_desc|created_desc|created_asc|featured_first
router.get(
  '/',
  // Tạm thời tắt cache để debug
  // cacheResponse({
  //   keyPrefix: 'destinations:list',
  //   ttl: Number(process.env.CACHE_TTL_SECONDS || 300),
  // }),
  async (req, res) => {
  const page = Number(req.query.page || 0);
  const pageSize = Number(req.query.pageSize || 0);
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const categoryIds = req.query.categoryIds
    ? req.query.categoryIds.toString().split(',').map((v) => Number(v)).filter(Boolean)
    : undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const q = (req.query.q || '').toString().trim();
  const country = req.query.country ? req.query.country.toString() : undefined;
  const sort = (req.query.sort || 'created_desc').toString();

  // Handle country filter
  let countryFilter = undefined;
  if (country === 'vietnam') {
    countryFilter = { country: 'Việt Nam' };
  } else if (country === 'international') {
    countryFilter = { country: { not: 'Việt Nam' } };
  }

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(categoryIds && categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
    ...(typeof minPrice === 'number' ? { price: { gte: minPrice } } : {}),
    ...(typeof maxPrice === 'number' ? { price: { lte: maxPrice } } : {}),
    ...(countryFilter || {}),
    // MySQL with utf8mb4_unicode_ci collation is case-insensitive by default
    ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
  };

  let orderBy;
  // Support both old format (name_asc) and new format (name-asc)
  if (sort === 'name_asc' || sort === 'name-asc') orderBy = { name: 'asc' };
  else if (sort === 'name_desc' || sort === 'name-desc') orderBy = { name: 'desc' };
  else if (sort === 'created_asc' || sort === 'created-asc') orderBy = { createdAt: 'asc' };
  else if (sort === 'price_asc' || sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc' || sort === 'price-desc') orderBy = { price: 'desc' };
  else if (sort === 'rating_desc' || sort === 'rating-desc') {
    // For rating, we'll need to join with reviews table or use a computed field
    // For now, sort by featured first, then by created date
    orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
  }
  else if (sort === 'popular' || sort === 'featured_first' || sort === 'featured-first') {
    orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
  }
  else orderBy = { createdAt: 'desc' };

  if (page > 0 && pageSize > 0) {
    const total = await prisma.destination.count({ where });
    const items = await prisma.destination.findMany({
      where,
      orderBy,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    console.log(`📍 Destinations list fetched: ${items.length} items (page ${page}, total: ${total})`);
    if (items.length > 0) {
      console.log(`  First item: ${items[0].name} (ID: ${items[0].id})`);
    }
    
    return res.json({ items, total, page, pageSize });
  }

  const items = await prisma.destination.findMany({
    where,
    orderBy,
    include: { category: true },
  });
  
  console.log(`📍 All destinations fetched: ${items.length} items`);
  
  res.json(items);
  }
);

// GET /api/destination/featured
router.get(
  '/featured',
  // Temporarily disable cache to ensure fresh data
  // cacheResponse({
  //   keyPrefix: 'destinations:featured',
  //   keyBuilder: (req) => `destinations:featured:${req.query.lang || 'en'}`,
  //   ttl: Number(process.env.CACHE_TTL_SECONDS || 600),
  // }),
  async (req, res) => {
  try {
    const items = await prisma.destination.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    
    console.log(`📍 Featured destinations fetched: ${items.length} items`);
    items.forEach((item) => {
      console.log(`  - ${item.name} (ID: ${item.id}, featured: ${item.featured})`);
    });
    
    // 🔥 CRITICAL: Tính rating từ reviews cho mỗi destination
    const itemsWithRating = await Promise.all(
      items.map(async (item) => {
        try {
          // Lấy reviews cho destination này
          const reviews = await prisma.review.findMany({
            where: { destinationId: item.id },
            select: { rating: true },
          });
          
          // Tính average rating từ reviews
          let avgRating = null;
          if (reviews && reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            avgRating = sum / reviews.length;
          }
          
          // Nếu không có reviews, dùng rating từ database hoặc null
          return {
            ...item,
            rating: avgRating || item.rating || null,
          };
        } catch (error) {
          console.error(`Error calculating rating for destination ${item.id}:`, error);
          return {
            ...item,
            rating: item.rating || null,
          };
        }
      })
    );
    
    res.json(itemsWithRating);
  } catch (error) {
    console.error('Error fetching featured destinations:', error);
    res.status(500).json({ message: 'Error fetching featured destinations' });
  }
  }
);

// GET /api/destination/:slug
router.get(
  '/:slug',
  cacheResponse({
    keyPrefix: 'destinations:slug',
    keyBuilder: (req) => `destinations:slug:${req.params.slug}`,
    ttl: Number(process.env.CACHE_TTL_SECONDS || 600),
  }),
  async (req, res) => {
  const { slug } = req.params;
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return res.status(404).json({ message: 'Destination not found' });
  res.json(dest);
  }
);

// Admin CRUD
router.post('/', authRequired, isAdmin, async (req, res) => {
  const { name, slug, description, featured = false, categoryId = null, price = 0, image = null } = req.body || {};
  if (!name || !slug) return res.status(400).json({ message: 'Missing fields' });
  const created = await prisma.destination.create({
    data: { name, slug, description, featured, categoryId, price, image },
  });
  
  console.log('✅ Destination created successfully:', { 
    id: created.id, 
    name: created.name, 
    slug: created.slug,
    price: created.price,
    image: created.image,
    featured: created.featured
  });
  
  // Invalidate all destination-related cache
  await invalidatePattern('destinations:*');
  
  // Also log cache invalidation
  console.log('🔄 Cache invalidated for destinations:*');
  
  res.status(201).json(created);
});

router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.destination.update({ where: { id }, data: req.body || {} });
    
    console.log('✅ Destination updated successfully:', { id, name: updated.name, slug: updated.slug });
    await invalidatePattern('destinations:*');
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating destination:', error);
    res.status(500).json({ message: 'Error updating destination' });
  }
});

router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Check if destination has tours, hotels, or restaurants
    const [tours, hotels, restaurants] = await Promise.all([
      prisma.tour.findMany({ where: { destinationId: id }, take: 1 }),
      prisma.hotel.findMany({ where: { destinationId: id }, take: 1 }),
      prisma.restaurant.findMany({ where: { destinationId: id }, take: 1 }),
    ]);
    
    if (tours.length > 0 || hotels.length > 0 || restaurants.length > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa điểm đến này vì đã có tour, khách sạn hoặc nhà hàng liên quan. Vui lòng xóa các dữ liệu liên quan trước.' 
      });
    }
    
    await prisma.destination.delete({ where: { id } });
    
    console.log('✅ Destination deleted successfully:', { id });
    await invalidatePattern('destinations:*');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting destination:', error);
    if (error.code === 'P2003') {
      res.status(400).json({ 
        message: 'Không thể xóa điểm đến này vì có dữ liệu liên quan (tour, khách sạn, nhà hàng, v.v.)' 
      });
    } else {
      res.status(500).json({ message: 'Error deleting destination' });
    }
  }
});

// Bulk delete
router.post('/bulk-delete', authRequired, isAdmin, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((v) => Number(v)).filter(Boolean) : [];
  if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
  await prisma.destination.deleteMany({ where: { id: { in: ids } } });
  await invalidatePattern('destinations:*');
  res.json({ deleted: ids.length });
});

module.exports = router;