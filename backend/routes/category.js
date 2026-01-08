// routes/category.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/category
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  res.json(categories);
});

module.exports = router;