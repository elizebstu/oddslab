import { Router } from 'express';
import { generateSitemap } from '../controllers/sitemapController';

const router = Router();

// No auth required for public sitemap
router.get('/sitemap.xml', generateSitemap);

export default router;
