// routes/reviewHelpful.js - Review helpful votes
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');

// POST /api/review-helpful/:reviewId - Vote helpful for review
router.post('/:reviewId', authRequired, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if already voted
    const existing = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: parseInt(reviewId),
          userId,
        },
      },
    });

    if (existing) {
      // Unvote
      await prisma.reviewHelpfulVote.delete({
        where: {
          reviewId_userId: {
            reviewId: parseInt(reviewId),
            userId,
          },
        },
      });

      // Decrease count
      await prisma.review.update({
        where: { id: parseInt(reviewId) },
        data: {
          helpfulCount: { decrement: 1 },
        },
      });

      return res.json({ helpful: false, count: await getHelpfulCount(parseInt(reviewId)) });
    }

    // Vote
    await prisma.reviewHelpfulVote.create({
      data: {
        reviewId: parseInt(reviewId),
        userId,
      },
    });

    // Increase count
    await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        helpfulCount: { increment: 1 },
      },
    });

    res.json({ helpful: true, count: await getHelpfulCount(parseInt(reviewId)) });
  } catch (error) {
    console.error('Error voting review:', error);
    res.status(500).json({ message: 'Lỗi vote review' });
  }
});

async function getHelpfulCount(reviewId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { helpfulCount: true },
  });
  return review?.helpfulCount || 0;
}

module.exports = router;

