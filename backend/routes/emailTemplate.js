// routes/emailTemplate.js - Email Template management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/email-template - Get all email templates (Admin only)
router.get('/', authRequired, isAdmin, async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách template' });
  }
});

// GET /api/email-template/:name - Get email template by name (Admin only)
router.get('/:name', authRequired, isAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const template = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template không tồn tại' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ message: 'Lỗi lấy template' });
  }
});

// POST /api/email-template - Create email template (Admin only)
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { name, subject, body, variables, isActive } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: variables || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Tên template đã tồn tại' });
    }
    console.error('Error creating email template:', error);
    res.status(500).json({ message: 'Lỗi tạo template' });
  }
});

// PUT /api/email-template/:id - Update email template (Admin only)
router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, variables, isActive } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(body && { body }),
        ...(variables !== undefined && { variables }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(template);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Template không tồn tại' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Tên template đã tồn tại' });
    }
    console.error('Error updating email template:', error);
    res.status(500).json({ message: 'Lỗi cập nhật template' });
  }
});

// DELETE /api/email-template/:id - Delete email template (Admin only)
router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.emailTemplate.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Xóa template thành công' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Template không tồn tại' });
    }
    console.error('Error deleting email template:', error);
    res.status(500).json({ message: 'Lỗi xóa template' });
  }
});

module.exports = router;

