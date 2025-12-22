// routes/hotel.js
const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/hotel
// Supports pagination, search, price range, city filter, destination filter and sort
router.get('/', async (req, res) => {
  const page = Number(req.query.page || 0);
  const pageSize = Number(req.query.pageSize || 0);
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const q = (req.query.q || '').toString().trim();
  const city = req.query.city ? req.query.city.toString() : undefined;
  const country = req.query.country ? req.query.country.toString() : undefined;
  const destinationId = req.query.destinationId ? Number(req.query.destinationId) : undefined;
  const featured = req.query.featured === 'true' ? true : undefined;
  const sort = (req.query.sort || 'created_desc').toString();

  const where = {
    ...(typeof minPrice === 'number' ? { pricePerNight: { gte: minPrice } } : {}),
    ...(typeof maxPrice === 'number' ? { pricePerNight: { lte: maxPrice } } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(country ? { country: { contains: country, mode: 'insensitive' } } : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { address: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  let orderBy;
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  else if (sort === 'name_desc') orderBy = { name: 'desc' };
  else if (sort === 'price_asc') orderBy = { pricePerNight: 'asc' };
  else if (sort === 'price_desc') orderBy = { pricePerNight: 'desc' };
  else if (sort === 'rating_desc') orderBy = { rating: 'desc' };
  else if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
  else if (sort === 'featured_first') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
  else orderBy = { createdAt: 'desc' };

  if (page > 0 && pageSize > 0) {
    const total = await prisma.hotel.count({ where });
    const items = await prisma.hotel.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        address: true,
        city: true,
        country: true,
        pricePerNight: true,
        rating: true,
        featured: true,
        amenities: true,
        contact: true,
        website: true,
        destinationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ items, total, page, pageSize });
  }

  const items = await prisma.hotel.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      address: true,
      city: true,
      country: true,
      pricePerNight: true,
      rating: true,
      featured: true,
      amenities: true,
      contact: true,
      website: true,
      destinationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(items);
});

// GET /api/hotel/featured
router.get('/featured', async (req, res) => {
  const items = await prisma.hotel.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  res.json(items);
});

// GET /api/hotel/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const hotel = await prisma.hotel.findUnique({ 
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      address: true,
      city: true,
      country: true,
      pricePerNight: true,
      rating: true,
      featured: true,
      amenities: true,
      contact: true,
      website: true,
      destinationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
  res.json(hotel);
});

// Admin CRUD
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, featured = false, pricePerNight = 0, image = null, address, city, country, rating = 0, amenities, contact, website, destinationId } = req.body || {};
    if (!name || !slug) return res.status(400).json({ message: 'Missing fields' });
    const created = await prisma.hotel.create({
      data: { name, slug, description, featured, pricePerNight, image, address, city, country, rating, amenities, contact, website, destinationId: destinationId ? Number(destinationId) : null },
    });
    
    console.log('✅ Hotel created successfully:', { id: created.id, name: created.name, slug: created.slug });
    res.status(201).json(created);
  } catch (error) {
    console.error('❌ Error creating hotel:', error);
    res.status(500).json({ message: 'Error creating hotel', error: error.message });
  }
});

router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.hotel.update({ where: { id }, data: req.body || {} });
    
    console.log('✅ Hotel updated successfully:', { id, name: updated.name, slug: updated.slug });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating hotel:', error);
    res.status(500).json({ message: 'Error updating hotel' });
  }
});

router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.hotel.delete({ where: { id } });
    
    console.log('✅ Hotel deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting hotel:', error);
    res.status(500).json({ message: 'Error deleting hotel' });
  }
});

module.exports = router;

