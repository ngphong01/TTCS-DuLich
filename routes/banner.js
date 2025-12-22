// routes/banner.js - Banner management API
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/banner - Get all active banners (public)
router.get('/', async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date();

    const where = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    if (position) {
      where.position = position;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// GET /api/banner/admin - Get all banners for admin
router.get('/admin', authRequired, isAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', position = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        position ? { position } : {},
      ],
    };

    const items = await prisma.banner.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.banner.count({ where });

    res.json({ items, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// GET /api/banner/:id - Get a single banner
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ message: 'Failed to fetch banner' });
  }
});

// POST /api/banner - Create a new banner
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { name, imageUrl, linkUrl, description, isActive, startDate, endDate, position } = req.body;

    const newBanner = await prisma.banner.create({
      data: {
        name,
        imageUrl,
        linkUrl,
        description,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        position,
      },
    });

    res.status(201).json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Failed to create banner' });
  }
});

// PUT /api/banner/:id - Update a banner
router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, linkUrl, description, isActive, startDate, endDate, position } = req.body;

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        name,
        imageUrl,
        linkUrl,
        description,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        position,
      },
    });

    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

// DELETE /api/banner/:id - Delete a banner
router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
});

module.exports = router;

