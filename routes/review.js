// routes/review.js
const express = require('express');
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// GET /api/review/slug/:slug - get reviews by destination slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const destination = await prisma.destination.findUnique({
      where: { slug: req.params.slug },
      select: { id: true }
    });
    
    if (!destination) {
      return res.json([]);
    }
    
    const items = await prisma.review.findMany({
      where: { destinationId: destination.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    
    // Transform to match frontend Review type
    const transformed = items.map(item => ({
      id: item.id.toString(),
      author: item.user?.name || 'Anonymous',
      rating: item.rating,
      comment: item.comment || '',
      date: item.createdAt.toISOString().split('T')[0]
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching reviews by slug:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// POST /api/review - create new review
router.post('/', async (req, res) => {
  try {
    const { slug, author, rating, comment } = req.body;
    
    // Get destination by slug
    const destination = await prisma.destination.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    // Get userId from auth token if available
    let userId = null;
    
    // Check if user is authenticated via token
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        // Token invalid, will create guest user if needed
      }
    }
    
    // If no userId and we have an author name, create a guest user for anonymous review
    if (!userId && author) {
      // Create a unique guest user email for this review
      const guestEmail = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@temp.travelgo`;
      
      // Create temporary guest user for anonymous review
      const guestUser = await prisma.user.create({
        data: {
          email: guestEmail,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
          name: author,
          role: 'USER'
        }
      });
      userId = guestUser.id;
    }
    
    // If still no userId, return error (schema requires userId)
    if (!userId) {
      return res.status(400).json({ 
        message: 'Authentication required or author name must be provided' 
      });
    }
    
    const review = await prisma.review.create({
      data: {
        destinationId: destination.id,
        userId,
        rating: Number(rating),
        comment,
      },
      include: { user: { select: { name: true } } }
    });
    
    // Transform response
    const transformed = {
      id: review.id.toString(),
      author: review.user?.name || author || 'Anonymous',
      rating: review.rating,
      comment: review.comment || '',
      date: review.createdAt.toISOString().split('T')[0]
    };
    
    console.log('✅ Review created successfully:', { 
      id: review.id, 
      destinationId: review.destinationId, 
      userId: review.userId,
      rating: review.rating 
    });
    
    res.status(201).json(transformed);
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// GET /api/review/:destinationId
router.get('/:destinationId', async (req, res) => {
  const destinationId = Number(req.params.destinationId);
  const items = await prisma.review.findMany({
    where: { destinationId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

// GET /api/review/user/:id
router.get('/user/:id', async (req, res) => {
  const userId = Number(req.params.id);
  const items = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { destination: { select: { name: true, slug: true } } }
  });
  res.json(items);
});

module.exports = router;