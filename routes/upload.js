// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/auth');
const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '..', 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const destinationsDir = path.join(uploadsDir, 'destinations');

[uploadsDir, avatarsDir, destinationsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Cấu hình multer cho avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Cấu hình multer cho destinations
const destinationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `destination-${uniqueSuffix}${ext}`);
  }
});

// File filter - chỉ cho phép ảnh
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadDestination = multer({
  storage: destinationStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter
});

// POST /api/upload/avatar - Upload avatar
const uploadAvatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const userId = req.user.id;
    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatarUrl in database
    const prisma = require('../lib/prisma');
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: fileUrl }
    });

    res.json({
      success: true,
      url: fileUrl,
      message: 'Upload avatar thành công'
    });
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({ error: 'Lỗi khi upload avatar', message: error.message });
  }
};

router.post('/avatar', authRequired, uploadAvatar.single('file'), uploadAvatarHandler);

// POST /api/upload/destination - Upload destination image
router.post('/destination', authRequired, uploadDestination.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const fileUrl = `/uploads/destinations/${req.file.filename}`;

    console.log('✅ Destination image uploaded successfully:', { 
      userId: req.user.id, 
      fileUrl, 
      filename: req.file.filename 
    });

    res.json({
      success: true,
      url: fileUrl,
      message: 'Upload ảnh điểm đến thành công'
    });
  } catch (error) {
    console.error('❌ Error uploading destination image:', error);
    res.status(500).json({ error: 'Lỗi khi upload ảnh', message: error.message });
  }
});

// Serve static files from uploads directory
router.use('/files', express.static(uploadsDir));

// Export handler for /api/account/avatar route
router.uploadAvatarHandler = uploadAvatarHandler;
router.uploadAvatar = uploadAvatar;

module.exports = router;
