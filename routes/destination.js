// routes/destination.js
const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/destination
// Supports pagination, multi-category filter, price range, search, country filter and sort
// ?page=1&pageSize=10&categoryId=1&categoryIds=1,2&q=beach&minPrice=0&maxPrice=10000000&country=vietnam|international&sort=name_asc|name_desc|created_desc|created_asc|featured_first
router.get('/', async (req, res) => {
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
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
  };

  let orderBy;
  if (sort === 'name_asc') orderBy = { name: 'asc' };
  else if (sort === 'name_desc') orderBy = { name: 'desc' };
  else if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
  else if (sort === 'featured_first') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
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
    return res.json({ items, total, page, pageSize });
  }

  const items = await prisma.destination.findMany({
    where,
    orderBy,
    include: { category: true },
  });
  res.json(items);
});

// GET /api/destination/featured
router.get('/featured', async (req, res) => {
  const items = await prisma.destination.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  res.json(items);
});

// GET /api/destination/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return res.status(404).json({ message: 'Destination not found' });
  res.json(dest);
});

// Admin CRUD
router.post('/', authRequired, isAdmin, async (req, res) => {
  const { name, slug, description, featured = false, categoryId = null, price = 0 } = req.body || {};
  if (!name || !slug) return res.status(400).json({ message: 'Missing fields' });
  const created = await prisma.destination.create({
    data: { name, slug, description, featured, categoryId, price },
  });
  
  console.log('✅ Destination created successfully:', { 
    id: created.id, 
    name: created.name, 
    slug: created.slug,
    price: created.price 
  });
  
  res.status(201).json(created);
});

router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.destination.update({ where: { id }, data: req.body || {} });
    
    console.log('✅ Destination updated successfully:', { id, name: updated.name, slug: updated.slug });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating destination:', error);
    res.status(500).json({ message: 'Error updating destination' });
  }
});

router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.destination.delete({ where: { id } });
    
    console.log('✅ Destination deleted successfully:', { id });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting destination:', error);
    res.status(500).json({ message: 'Error deleting destination' });
  }
});

// Bulk delete
router.post('/bulk-delete', authRequired, isAdmin, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((v) => Number(v)).filter(Boolean) : [];
  if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
  await prisma.destination.deleteMany({ where: { id: { in: ids } } });
  res.json({ deleted: ids.length });
});

module.exports = router;