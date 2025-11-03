// routes/chat.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// GET /api/chat/history?limit=20 - get chat history
router.get('/history', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    // For now, return empty or mock data since we don't have a ChatMessage model yet
    // In production, query: await prisma.chatMessage.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
    res.json({ messages: [] });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// DELETE /api/chat/history - clear chat history
router.delete('/history', async (req, res) => {
  try {
    // In production: await prisma.chatMessage.deleteMany({ where: { userId: req.user.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Error clearing chat history' });
  }
});

// POST /api/chat - send chat message
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    // For now, return a mock response
    // In production, save message and get AI response
    res.json({
      id: Date.now().toString(),
      message,
      response: "Xin chào! Đây là phản hồi mẫu. Tính năng chat đang được phát triển.",
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Error sending chat message' });
  }
});

module.exports = router;
