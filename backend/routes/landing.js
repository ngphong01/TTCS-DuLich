// routes/landing.js - Seasonal landing pages
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/landing/seasonal - Get seasonal landing page content
router.get('/seasonal', async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    // Determine season based on month
    let season = 'spring'; // Default
    let seasonName = 'Mùa xuân';
    let seasonDescription = 'Khám phá vẻ đẹp mùa xuân';

    if (month >= 3 && month <= 5) {
      season = 'spring';
      seasonName = 'Mùa xuân';
      seasonDescription = 'Mùa của hoa đào, hoa mai và không khí trong lành';
    } else if (month >= 6 && month <= 8) {
      season = 'summer';
      seasonName = 'Mùa hè';
      seasonDescription = 'Mùa của biển xanh, cát trắng và nắng vàng';
    } else if (month >= 9 && month <= 11) {
      season = 'autumn';
      seasonName = 'Mùa thu';
      seasonDescription = 'Mùa của lá vàng, gió mát và cảnh đẹp lãng mạn';
    } else {
      season = 'winter';
      seasonName = 'Mùa đông';
      seasonDescription = 'Mùa của tuyết trắng, không khí se lạnh và trải nghiệm độc đáo';
    }

    // Get featured tours for this season
    const featuredTours = await prisma.tour.findMany({
      where: {
        featured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        adultPrice: true,
        childPrice: true,
        duration: true,
        rating: true,
        reviewCount: true,
        tags: true,
        destination: {
          select: {
            name: true,
            country: true,
          },
        },
      },
      take: 6,
      orderBy: {
        rating: 'desc',
      },
    });

    // Get flash sales
    const flashSales = await prisma.tour.findMany({
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
        flashSaleEnd: true,
      },
      take: 4,
      orderBy: {
        flashSaleStart: 'desc',
      },
    });

    res.json({
      season,
      seasonName,
      seasonDescription,
      month,
      featuredTours,
      flashSales: flashSales.map(tour => ({
        ...tour,
        discountPercent: tour.flashSalePrice
          ? Math.round(((tour.price - tour.flashSalePrice) / tour.price) * 100)
          : 0,
      })),
      banner: {
        title: `Du lịch ${seasonName} - ${seasonDescription}`,
        subtitle: 'Khám phá những điểm đến tuyệt vời nhất',
        image: `/images/seasons/${season}.jpg`,
      },
    });
  } catch (error) {
    console.error('Error fetching seasonal landing:', error);
    res.status(500).json({ message: 'Error fetching seasonal landing page' });
  }
});

// GET /api/landing/seasonal/:season - Get specific season landing page
router.get('/seasonal/:season', async (req, res) => {
  try {
    const { season } = req.params;
    const validSeasons = ['spring', 'summer', 'autumn', 'winter'];

    if (!validSeasons.includes(season)) {
      return res.status(400).json({ message: 'Invalid season' });
    }

    const seasonNames = {
      spring: 'Mùa xuân',
      summer: 'Mùa hè',
      autumn: 'Mùa thu',
      winter: 'Mùa đông',
    };

    const seasonDescriptions = {
      spring: 'Mùa của hoa đào, hoa mai và không khí trong lành',
      summer: 'Mùa của biển xanh, cát trắng và nắng vàng',
      autumn: 'Mùa của lá vàng, gió mát và cảnh đẹp lãng mạn',
      winter: 'Mùa của tuyết trắng, không khí se lạnh và trải nghiệm độc đáo',
    };

    // Get tours suitable for this season
    const tours = await prisma.tour.findMany({
      where: {
        featured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        adultPrice: true,
        childPrice: true,
        duration: true,
        rating: true,
        reviewCount: true,
        tags: true,
        destination: {
          select: {
            name: true,
            country: true,
          },
        },
      },
      take: 12,
      orderBy: {
        rating: 'desc',
      },
    });

    res.json({
      season,
      seasonName: seasonNames[season],
      seasonDescription: seasonDescriptions[season],
      tours,
      banner: {
        title: `Du lịch ${seasonNames[season]}`,
        subtitle: seasonDescriptions[season],
        image: `/images/seasons/${season}.jpg`,
      },
    });
  } catch (error) {
    console.error('Error fetching seasonal landing:', error);
    res.status(500).json({ message: 'Error fetching seasonal landing page' });
  }
});

module.exports = router;

