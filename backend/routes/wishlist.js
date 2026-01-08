// routes/wishlist.js
const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// GET /api/wishlist/user/:id - Get wishlist by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// POST /api/wishlist - Add destination to wishlist
router.post('/', authRequired, async (req, res) => {
  try {
    const { destinationId } = req.body;
    const userId = req.user.id;

    if (!destinationId) {
      return res.status(400).json({ message: 'Missing destinationId' });
    }

    // Check if destination exists
    const destination = await prisma.destination.findUnique({
      where: { id: Number(destinationId) }
    });

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: Number(destinationId)
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Destination already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        destinationId: Number(destinationId)
      },
      include: { destination: true }
    });

    console.log('✅ Added to wishlist:', { 
      id: wishlistItem.id, 
      userId: wishlistItem.userId, 
      destinationId: wishlistItem.destinationId 
    });
    
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
});

// DELETE /api/wishlist/:id - Remove from wishlist
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    // Verify ownership
    const item = await prisma.wishlist.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    if (item.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.wishlist.delete({
      where: { id }
    });

    console.log('✅ Removed from wishlist:', { id, userId });
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

module.exports = router;