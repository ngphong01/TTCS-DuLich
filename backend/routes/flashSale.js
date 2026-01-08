// routes/flashSale.js - Flash sale management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/flash-sale - Get active flash sales (public)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const tours = await prisma.tour.findMany({
      where: {
        flashSale: true,
        flashSaleStart: { lte: now },
        flashSaleEnd: { gte: now },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        flashSalePrice: true,
        flashSaleStart: true,
        flashSaleEnd: true,
        duration: true,
        rating: true,
        destination: {
          select: {
            name: true,
            country: true,
          },
        },
      },
      orderBy: {
        flashSaleStart: 'desc',
      },
    });

    res.json({
      success: true,
      tours: tours.map((tour) => ({
        ...tour,
        discountPercent: tour.flashSalePrice
          ? Math.round(((tour.price - tour.flashSalePrice) / tour.price) * 100)
          : 0,
        timeRemaining: tour.flashSaleEnd ? Math.max(0, tour.flashSaleEnd - now) : 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    res.status(500).json({ message: 'Error fetching flash sales' });
  }
});

// GET /api/flash-sale/:tourId - Get flash sale details for a tour
router.get('/:tourId', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const now = new Date();

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        flashSale: true,
        flashSalePrice: true,
        flashSaleStart: true,
        flashSaleEnd: true,
      },
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const isActive =
      tour.flashSale &&
      tour.flashSaleStart &&
      tour.flashSaleEnd &&
      now >= tour.flashSaleStart &&
      now <= tour.flashSaleEnd;

    res.json({
      success: true,
      flashSale: isActive,
      originalPrice: tour.price,
      flashSalePrice: isActive ? tour.flashSalePrice : null,
      discountPercent: isActive && tour.flashSalePrice
        ? Math.round(((tour.price - tour.flashSalePrice) / tour.price) * 100)
        : 0,
      startTime: tour.flashSaleStart,
      endTime: tour.flashSaleEnd,
      timeRemaining: isActive && tour.flashSaleEnd ? Math.max(0, tour.flashSaleEnd - now) : 0,
    });
  } catch (error) {
    console.error('Error fetching flash sale details:', error);
    res.status(500).json({ message: 'Error fetching flash sale details' });
  }
});

// POST /api/flash-sale/admin - Create/update flash sale (Admin)
router.post('/admin', authRequired, isAdmin, async (req, res) => {
  try {
    const { tourId, flashSalePrice, startTime, endTime } = req.body;

    if (!tourId || !flashSalePrice || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: parseInt(tourId) },
      select: { price: true },
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    if (parseInt(flashSalePrice) >= tour.price) {
      return res.status(400).json({ message: 'Flash sale price must be less than original price' });
    }

    const updatedTour = await prisma.tour.update({
      where: { id: parseInt(tourId) },
      data: {
        flashSale: true,
        flashSalePrice: parseInt(flashSalePrice),
        flashSaleStart: new Date(startTime),
        flashSaleEnd: new Date(endTime),
      },
    });

    res.json({
      success: true,
      tour: updatedTour,
      message: 'Flash sale created successfully',
    });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    res.status(500).json({ message: 'Error creating flash sale' });
  }
});

// DELETE /api/flash-sale/admin/:tourId - End flash sale (Admin)
router.delete('/admin/:tourId', authRequired, isAdmin, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);

    const updatedTour = await prisma.tour.update({
      where: { id: tourId },
      data: {
        flashSale: false,
        flashSalePrice: null,
        flashSaleStart: null,
        flashSaleEnd: null,
      },
    });

    res.json({
      success: true,
      message: 'Flash sale ended successfully',
    });
  } catch (error) {
    console.error('Error ending flash sale:', error);
    res.status(500).json({ message: 'Error ending flash sale' });
  }
});

module.exports = router;

