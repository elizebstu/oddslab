import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const generateSitemap = async (req: Request, res: Response) => {
  try {
    const SITE_URL = process.env.BASE_URL || 'https://oddslab.com';

    // Get all public rooms
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      select: { id: true, updatedAt: true },
    });

    // Get unique address count across all rooms (for SEO content metrics)
    const allRooms = await prisma.room.findMany({
      select: { id: true, addresses: { select: { address: true } } },
    });

    const totalAddresses = new Set(
      allRooms.flatMap(r => r.addresses.map((a: { address: string }) => a.address.toLowerCase()))
    ).size;

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</></url>
  <url><loc>${SITE_URL}/explore</loc><changefreq>daily</changefreq><priority>0.9</changefreq>daily</changefreq></url>

  <!-- Public rooms -->
${rooms.map(room => {
    const lastmod = room.updatedAt ? room.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url><loc>${SITE_URL}/public/${room.id}</loc><changefreq>weekly</changefreq><lastmod>${lastmod}</lastmod></url>`;
  }).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

export const getSitemapContent = async () => {
  const SITE_URL = process.env.BASE_URL || 'https://oddslab.com';

  const rooms = await prisma.room.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0></url>
  <url><loc>${SITE_URL}/explore</loc><changefreq>daily</changefreq><priority>0.9</changefreq>daily</changefreq></url>
${rooms.map(room => {
    const lastmod = room.updatedAt ? room.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url><loc>${SITE_URL}/public/${room.id}</loc><changefreq>weekly</changefreq><lastmod>${lastmod}</lastmod></url>`;
  }).join('\n')}
</urlset>`;

  return sitemap;
};
