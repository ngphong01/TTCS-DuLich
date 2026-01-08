// routes/user.js
const express = require('express');
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/user/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, avatarUrl: true, settings: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// PUT /api/user/:id
router.put('/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, avatarUrl, settings } = req.body || {};
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(settings !== undefined ? { settings } : {}),
    },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, settings: true },
  });
  res.json(updated);
});

// PUT /api/user/:id/settings
router.put('/:id/settings', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, avatarUrl, settings } = req.body || {};
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(settings !== undefined ? { settings } : {}),
    },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true, settings: true },
  });
  res.json({ message: 'Settings updated', user: updated });
});

// PUT /api/user/:id/password
router.put('/:id/password', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ message: 'Missing password' });
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  res.json({ message: 'Password changed' });
});

// 🎨 POST /api/user/:id/avatar/generate - Tạo avatar ngẫu nhiên mới
router.post('/:id/avatar/generate', authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Kiểm tra quyền (chỉ user mình hoặc admin mới được thay đổi)
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
    }

    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tạo avatar mới
    const { createUserAvatar } = require('../lib/avatarGenerator');
    const newAvatar = createUserAvatar(user.name, user.email, id);

    // Cập nhật vào database
    const updated = await prisma.user.update({
      where: { id },
      data: { avatarUrl: newAvatar },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });

    console.log('✅ Avatar generated successfully for user:', id);
    res.json({ 
      message: 'Tạo avatar mới thành công',
      user: updated,
      avatarUrl: newAvatar,
    });
  } catch (error) {
    console.error('❌ Error generating avatar:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tạo avatar',
      error: error.message,
    });
  }
});

// 🎨 GET /api/user/:id/avatar/options - Lấy danh sách avatar để chọn
router.get('/:id/avatar/options', authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Kiểm tra quyền
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
    }

    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tạo nhiều avatar options
    const { generateAvatarOptions } = require('../lib/avatarGenerator');
    const avatarOptions = generateAvatarOptions(user.name, user.email, 8);

    res.json({ 
      message: 'Lấy danh sách avatar thành công',
      avatars: avatarOptions,
    });
  } catch (error) {
    console.error('❌ Error getting avatar options:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách avatar',
      error: error.message,
    });
  }
});

// 🎨 PUT /api/user/:id/avatar - Cập nhật avatar (từ URL hoặc chọn từ options)
router.put('/:id/avatar', authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { avatarUrl } = req.body || {};

    // Kiểm tra quyền
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
    }

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Thiếu avatarUrl' });
    }

    // Cập nhật avatar
    const updated = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });

    console.log('✅ Avatar updated successfully for user:', id);
    res.json({ 
      message: 'Cập nhật avatar thành công',
      user: updated,
    });
  } catch (error) {
    console.error('❌ Error updating avatar:', error);
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật avatar',
      error: error.message,
    });
  }
});

module.exports = router;