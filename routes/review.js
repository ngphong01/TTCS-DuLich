// routes/review.js
const express = require('express');
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { reviewLimiter } = require('../middleware/rateLimit');
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
    
    // Use select to avoid fields that might not exist in DB
    let items = [];
    try {
      items = await prisma.review.findMany({
        where: { destinationId: destination.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } }
        }
      });
    } catch (dbError) {
      // If database schema doesn't match, log and return empty array
      if (dbError.code === 'P2022' || dbError.message?.includes('does not exist')) {
        console.log('⚠️  Review schema mismatch. Field "images" may not exist in database.');
        console.log('   Run: npx prisma db push or npx prisma migrate dev');
        // Return empty array instead of crashing
        items = [];
      } else {
        throw dbError;
      }
    }
    
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
router.post('/', reviewLimiter, async (req, res) => {
  try {
    const { slug, author, rating, comment, images } = req.body;
    
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

    // Verify user has completed booking for this destination (optional check)
    // Only check if user is authenticated (not guest)
    if (userId) {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
      });
      if (user && !user.email.startsWith('guest-')) {
        const hasCompletedBooking = await prisma.booking.findFirst({
          where: {
            userId,
            destinationId: destination.id,
            status: 'COMPLETED',
          },
        });

        if (!hasCompletedBooking) {
          // Allow review but mark as unverified (can be shown differently in UI)
          // Or return error if strict verification is required
          // For now, we'll allow it but log a warning
          console.warn(`⚠️ User ${userId} reviewing destination ${destination.id} without completed booking`);
        }
      }
    }
    
    // Create review data without images field if it doesn't exist in DB
    const reviewData = {
      destinationId: destination.id,
      userId,
      rating: Number(rating),
      comment,
    };
    
    // Only add images if the field exists in database
    // For now, skip images field to avoid schema mismatch
    // if (images && Array.isArray(images)) {
    //   reviewData.images = images;
    // }
    
    const review = await prisma.review.create({
      data: reviewData,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } }
      }
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
  try {
    const destinationId = Number(req.params.destinationId);
    const items = await prisma.review.findMany({
      where: { destinationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        userId: true,
        destinationId: true,
      }
    });
    res.json(items);
  } catch (error) {
    if (error.code === 'P2022' || error.message?.includes('does not exist')) {
      console.log('⚠️  Review schema mismatch. Field "images" may not exist in database.');
      console.log('   Run: npx prisma db push or npx prisma migrate dev');
      // Return empty array instead of crashing
      res.json([]);
    } else {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }
});

// GET /api/review/user/:id
router.get('/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const items = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        destination: { select: { name: true, slug: true } }
      }
    });
    res.json(items);
  } catch (error) {
    if (error.code === 'P2022' || error.message?.includes('does not exist')) {
      console.log('⚠️  Review schema mismatch. Field "images" may not exist in database.');
      console.log('   Run: npx prisma db push or npx prisma migrate dev');
      // Return empty array instead of crashing
      res.json([]);
    } else {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }
});

// PUT /api/review/:id/approve - Approve/reject review (Admin only)
router.put('/:id/approve', require('../middleware/auth').authRequired, require('../middleware/auth').isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { approved: approved === true },
      select: {
        id: true,
        rating: true,
        comment: true,
        approved: true,
        createdAt: true,
        user: { select: { name: true } },
        destination: { select: { name: true } }
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Lỗi duyệt review' });
  }
});

module.exports = router;