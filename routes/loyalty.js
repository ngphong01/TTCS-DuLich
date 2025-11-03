// routes/loyalty.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/loyalty/:userId
router.get('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  const record = await prisma.loyalty.findUnique({ where: { userId } });
  res.json(record || { userId, points: 0 });
});

module.exports = router;