// routes/blog.js - Blog management
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authRequired, isAdmin } = require('../middleware/auth');

// GET /api/blog - Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 12, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const where = {
      published: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(pageSize),
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          author: true,
          category: true,
          tags: true,
          publishedAt: true,
          views: true,
        },
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách blog' });
  }
});

// GET /api/blog/:slug - Get blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog không tồn tại' });
    }

    // Increment views
    await prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });

    res.json({ ...blog, views: blog.views + 1 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Lỗi lấy blog' });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// GET /api/blog/admin - List all blogs (Admin)
router.get('/admin/list', authRequired, isAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search, published } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(published !== undefined && { published: published === 'true' }),
    };

    const [items, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(pageSize),
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách blog' });
  }
});

// GET /api/blog/admin/:id - Get blog details (Admin)
router.get('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog không tồn tại' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Lỗi lấy blog' });
  }
});

// POST /api/blog/admin - Create blog (Admin)
router.post('/admin', authRequired, isAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      published,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Check if slug already exists
    const existing = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        author: author || 'TravelGo Team',
        category,
        tags: tags || [],
        seoTitle,
        seoDescription,
        seoKeywords,
        published: published || false,
        publishedAt: published ? new Date() : null,
      },
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Lỗi tạo blog' });
  }
});

// PUT /api/blog/admin/:id - Update blog (Admin)
router.put('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      published,
    } = req.body;

    // Check if slug already exists (if changing slug)
    if (slug) {
      const existing = await prisma.blog.findFirst({
        where: {
          slug,
          NOT: { id: parseInt(id) },
        },
      });

      if (existing) {
        return res.status(400).json({ message: 'Slug đã tồn tại' });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (author) updateData.author = author;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (published !== undefined) {
      updateData.published = published;
      // Set publishedAt if publishing for the first time
      if (published) {
        const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
        if (blog && !blog.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Lỗi cập nhật blog' });
  }
});

// DELETE /api/blog/admin/:id - Delete blog (Admin)
router.delete('/admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog không tồn tại' });
    }

    await prisma.blog.delete({
      where: { id: blogId },
    });

    console.log('✅ Blog deleted successfully:', { id: blogId });
    res.json({ message: 'Xóa blog thành công' });
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    if (error.code === 'P2003') {
      res.status(400).json({ 
        message: 'Không thể xóa blog này vì có dữ liệu liên quan' 
      });
    } else {
      res.status(500).json({ message: 'Lỗi xóa blog', error: error.message });
    }
  }
});

module.exports = router;

