// routes/restaurant.js
const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/restaurant
// Supports pagination, search, cuisine filter, city filter, destination filter and sort
router.get('/', async (req, res) => {
  const page = Number(req.query.page || 0);
  const pageSize = Number(req.query.pageSize || 0);
  const q = (req.query.q || '').toString().trim();
  const city = req.query.city ? req.query.city.toString() : undefined;
  const country = req.query.country ? req.query.country.toString() : undefined;
  const cuisine = req.query.cuisine ? req.query.cuisine.toString() : undefined;
  const priceRange = req.query.priceRange ? req.query.priceRange.toString() : undefined;
  const destinationId = req.query.destinationId ? Number(req.query.destinationId) : undefined;
  const featured = req.query.featured === 'true' ? true : undefined;
  const sort = (req.query.sort || 'created_desc').toString();

  const where = {
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(country ? { country: { contains: country, mode: 'insensitive' } } : {}),
    ...(cuisine ? { cuisine: { contains: cuisine, mode: 'insensitive' } } : {}),
    ...(priceRange ? { priceRange } : {}),
    ...(destinationId ? { destinationId } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { address: { contains: q, mode: 'insensitive' } }, { cuisine: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  let orderBy;
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  else if (sort === 'name_desc') orderBy = { name: 'desc' };
  else if (sort === 'rating_desc') orderBy = { rating: 'desc' };
  else if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
  else if (sort === 'featured_first') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
  else orderBy = { createdAt: 'desc' };

  if (page > 0 && pageSize > 0) {
    const total = await prisma.restaurant.count({ where });
    const items = await prisma.restaurant.findMany({
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
        cuisine: true,
        priceRange: true,
        rating: true,
        featured: true,
        amenities: true,
        contact: true,
        website: true,
        openingHours: true,
        destinationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ items, total, page, pageSize });
  }

  const items = await prisma.restaurant.findMany({
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
      cuisine: true,
      priceRange: true,
      rating: true,
      featured: true,
      amenities: true,
      contact: true,
      website: true,
      openingHours: true,
      destinationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(items);
});

// GET /api/restaurant/featured
router.get('/featured', async (req, res) => {
  const items = await prisma.restaurant.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  res.json(items);
});

// GET /api/restaurant/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const restaurant = await prisma.restaurant.findUnique({ 
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
      cuisine: true,
      priceRange: true,
      rating: true,
      featured: true,
      amenities: true,
      contact: true,
      website: true,
      openingHours: true,
      destinationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant);
});

// Admin CRUD
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { name, slug, description, featured = false, image = null, address, city, country, cuisine, priceRange, rating = 0, amenities, contact, website, openingHours, destinationId } = req.body || {};
    if (!name || !slug) return res.status(400).json({ message: 'Missing fields' });
    const created = await prisma.restaurant.create({
      data: { name, slug, description, featured, image, address, city, country, cuisine, priceRange, rating, amenities, contact, website, openingHours, destinationId: destinationId ? Number(destinationId) : null },
    });
    
    console.log('✅ Restaurant created successfully:', { id: created.id, name: created.name, slug: created.slug });
    res.status(201).json(created);
  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    res.status(500).json({ message: 'Error creating restaurant', error: error.message });
  }
});

router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.restaurant.update({ where: { id }, data: req.body || {} });
    
    console.log('✅ Restaurant updated successfully:', { id, name: updated.name, slug: updated.slug });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating restaurant:', error);
    res.status(500).json({ message: 'Error updating restaurant' });
  }
});

router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.restaurant.delete({ where: { id } });
    
    console.log('✅ Restaurant deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting restaurant:', error);
    res.status(500).json({ message: 'Error deleting restaurant' });
  }
});

module.exports = router;

