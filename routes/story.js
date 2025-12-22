const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authRequired, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/stories
 * @desc    Get all stories (paginated)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { featured, category, destinationId } = req.query;
    
    const where = { published: true };
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (destinationId) {
      where.destinationId = parseInt(destinationId);
    }
    
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          destination: {
            select: { id: true, name: true, slug: true, image: true }
          }
        }
      }),
      prisma.story.count({ where })
    ]);
    
    res.json({
      items: stories,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stories/featured
 * @desc    Get featured stories
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const stories = await prisma.story.findMany({
      where: { featured: true, published: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        destination: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
    
    res.json(stories);
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stories/:slug
 * @desc    Get story by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const story = await prisma.story.findUnique({
      where: { slug: req.params.slug },
      include: {
        destination: {
          select: { id: true, name: true, slug: true, image: true }
        }
      }
    });
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Increment views
    await prisma.story.update({
      where: { id: story.id },
      data: { views: { increment: 1 } }
    });
    
    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/stories/:id/like
 * @desc    Like/unlike a story
 * @access  Public
 */
router.post('/:id/like', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const { increment } = req.body; // true to like, false to unlike
    
    const story = await prisma.story.update({
      where: { id: storyId },
      data: { likes: { increment: increment ? 1 : -1 } }
    });
    
    res.json({ likes: story.likes });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/stories
 * @desc    Create a new story (admin)
 * @access  Private/Admin
 */
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const story = await prisma.story.create({
      data: req.body
    });
    
    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/stories/:id
 * @desc    Update story (admin)
 * @access  Private/Admin
 */
router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const story = await prisma.story.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/stories/:id
 * @desc    Delete story (admin)
 * @access  Private/Admin
 */
router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    await prisma.story.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

