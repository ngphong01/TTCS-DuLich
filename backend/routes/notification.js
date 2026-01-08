// routes/notification.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/notification/user/:id
router.get('/user/:id', async (req, res) => {
  const userId = Number(req.params.id);
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

module.exports = router;