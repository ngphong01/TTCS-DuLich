// routes/support.js
const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// POST /api/support - Create support ticket
router.post('/', async (req, res) => {
  try {
    const { userEmail, subject, message } = req.body;

    if (!userEmail || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields: userEmail, subject, message' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userEmail,
        subject,
        message,
        status: 'open'
      }
    });

    console.log('✅ Support ticket created successfully:', { 
      id: ticket.id, 
      userEmail: ticket.userEmail, 
      subject: ticket.subject 
    });
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticketId: ticket.id,
      ticket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Error creating support ticket', error: error.message });
  }
});

// GET /api/support - Get all support tickets (for admin)
router.get('/', async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Error fetching support tickets' });
  }
});

module.exports = router;