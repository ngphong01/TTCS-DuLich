// routes/promo.js - Promo Code / Voucher management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');
const { promoLimiter } = require('../middleware/rateLimit');

// GET /api/promo/validate/:code - Validate promo code (public)
router.get('/validate/:code', promoLimiter, async (req, res) => {
  try {
    const { code } = req.params;
    const { amount } = req.query; // Optional: check minimum amount

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { usages: true },
    });

    if (!promoCode) {
      return res.json({ valid: false, message: 'Mã giảm giá không tồn tại' });
    }

    if (!promoCode.active) {
      return res.json({ valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa' });
    }

    const now = new Date();
    if (now < promoCode.validFrom) {
      return res.json({ valid: false, message: 'Mã giảm giá chưa có hiệu lực' });
    }

    if (now > promoCode.validUntil) {
      return res.json({ valid: false, message: 'Mã giảm giá đã hết hạn' });
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return res.json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (amount && promoCode.minAmount > parseInt(amount)) {
      return res.json({
        valid: false,
        message: `Đơn hàng tối thiểu ${promoCode.minAmount.toLocaleString('vi-VN')} VNĐ để sử dụng mã này`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((parseInt(amount || 0) * promoCode.discountValue) / 100);
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    res.json({
      valid: true,
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      discountAmount,
      minAmount: promoCode.minAmount,
      maxDiscount: promoCode.maxDiscount,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ valid: false, message: 'Lỗi xác thực mã giảm giá' });
  }
});

// POST /api/promo/apply - Apply promo code to booking
router.post('/apply', authRequired, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const userId = req.user.id;

    if (!code || !amount) {
      return res.status(400).json({ message: 'Code and amount are required' });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { usages: true },
    });

    if (!promoCode || !promoCode.active) {
      return res.status(400).json({ message: 'Mã giảm giá không hợp lệ' });
    }

    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn hoặc chưa có hiệu lực' });
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (promoCode.minAmount > parseInt(amount)) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${promoCode.minAmount.toLocaleString('vi-VN')} VNĐ`,
      });
    }

    // Check if user already used this code
    const userUsage = await prisma.promoCodeUsage.findFirst({
      where: {
        promoCodeId: promoCode.id,
        userId: userId,
      },
    });

    if (userUsage) {
      return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((parseInt(amount) * promoCode.discountValue) / 100);
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    res.json({
      success: true,
      discountAmount,
      finalAmount: Math.max(0, parseInt(amount) - discountAmount),
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
      },
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ message: 'Lỗi áp dụng mã giảm giá' });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// GET /api/promo/admin - List all promo codes (Admin)
router.get('/admin', authRequired, isAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        include: {
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(pageSize),
      }),
      prisma.promoCode.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách mã giảm giá' });
  }
});

// GET /api/promo/admin/:id - Get promo code details (Admin)
router.get('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: parseInt(id) },
      include: {
        usages: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    res.json(promoCode);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ message: 'Lỗi lấy thông tin mã giảm giá' });
  }
});

// POST /api/promo/admin - Create promo code (Admin)
router.post('/admin', authRequired, isAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      active,
      applicableTo,
    } = req.body;

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseInt(discountValue),
        minAmount: parseInt(minAmount || 0),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        active: active !== undefined ? active : true,
        applicableTo: applicableTo || ['ALL'],
      },
    });

    res.status(201).json(promoCode);
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ message: 'Lỗi tạo mã giảm giá' });
  }
});

// PUT /api/promo/admin/:id - Update promo code (Admin)
router.put('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      active,
      applicableTo,
    } = req.body;

    // Check if code already exists (if changing code)
    if (code) {
      const existing = await prisma.promoCode.findFirst({
        where: {
          code: code.toUpperCase(),
          NOT: { id: parseInt(id) },
        },
      });

      if (existing) {
        return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
      }
    }

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseInt(discountValue);
    if (minAmount !== undefined) updateData.minAmount = parseInt(minAmount);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseInt(maxDiscount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (validFrom) updateData.validFrom = new Date(validFrom);
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (active !== undefined) updateData.active = active;
    if (applicableTo) updateData.applicableTo = applicableTo;

    const promoCode = await prisma.promoCode.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(promoCode);
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ message: 'Lỗi cập nhật mã giảm giá' });
  }
});

// DELETE /api/promo/admin/:id - Delete promo code (Admin)
router.delete('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.promoCode.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Xóa mã giảm giá thành công' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ message: 'Lỗi xóa mã giảm giá' });
  }
});

module.exports = router;

