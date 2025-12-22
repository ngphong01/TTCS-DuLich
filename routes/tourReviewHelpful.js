// routes/tourReviewHelpful.js - Tour review helpful votes
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');

// POST /api/tour-review-helpful/:reviewId - Vote helpful for tour review
router.post('/:reviewId', authRequired, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if already voted
    const existing = await prisma.tourReviewHelpfulVote.findUnique({
      where: {
        tourReviewId_userId: {
          tourReviewId: parseInt(reviewId),
          userId,
        },
      },
    });

    if (existing) {
      // Unvote
      await prisma.tourReviewHelpfulVote.delete({
        where: {
          tourReviewId_userId: {
            tourReviewId: parseInt(reviewId),
            userId,
          },
        },
      });

      // Decrease count
      await prisma.tourReview.update({
        where: { id: parseInt(reviewId) },
        data: {
          helpfulCount: { decrement: 1 },
        },
      });

      return res.json({ helpful: false, count: await getHelpfulCount(parseInt(reviewId)) });
    }

    // Vote
    await prisma.tourReviewHelpfulVote.create({
      data: {
        tourReviewId: parseInt(reviewId),
        userId,
      },
    });

    // Increase count
    await prisma.tourReview.update({
      where: { id: parseInt(reviewId) },
      data: {
        helpfulCount: { increment: 1 },
      },
    });

    res.json({ helpful: true, count: await getHelpfulCount(parseInt(reviewId)) });
  } catch (error) {
    console.error('Error voting tour review:', error);
    res.status(500).json({ message: 'Lỗi vote review' });
  }
});

async function getHelpfulCount(reviewId) {
  const review = await prisma.tourReview.findUnique({
    where: { id: reviewId },
    select: { helpfulCount: true },
  });
  return review?.helpfulCount || 0;
}

module.exports = router;

