// routes/sitemap.js - Generate sitemap.xml and robots.txt
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /sitemap.xml - Generate sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    // Get all destinations
    const destinations = await prisma.destination.findMany({
      where: { featured: true },
      select: { slug: true, updatedAt: true },
    });

    // Get all published blogs
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    // Get all tours
    const tours = await prisma.tour.findMany({
      where: { featured: true },
      select: { slug: true, updatedAt: true },
    });

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tours</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add destinations
    destinations.forEach((dest) => {
      xml += `  <url>
    <loc>${baseUrl}/destinations/${dest.slug}</loc>
    <lastmod>${new Date(dest.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Add tours
    tours.forEach((tour) => {
      xml += `  <url>
    <loc>${baseUrl}/tours/${tour.slug}</loc>
    <lastmod>${new Date(tour.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Add blogs
    blogs.forEach((blog) => {
      xml += `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// GET /robots.txt - Generate robots.txt
router.get('/robots.txt', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /api/

Sitemap: ${sitemapUrl}
`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

module.exports = router;

