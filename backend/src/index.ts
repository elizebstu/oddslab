import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, isDevelopment } from './config/config';
import { logger } from './utils/logger';
import { resolve } from 'path';
import authRoutes from './routes/auth';
import otpRoutes from './routes/otp';
import roomRoutes from './routes/rooms';
import addressRoutes from './routes/addresses';
import postRoutes from './routes/posts';
import sitemapRoutes from './routes/sitemap';
import onboardingRoutes from './routes/onboarding';

const app = express();
const PORT = config.PORT;

// CORS configuration with support for Vercel preview deployments
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins and patterns
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://oddslab-cyan.vercel.app',
    ];

    // Check if origin matches allowed origins or Vercel preview pattern
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') || // Allow all Vercel preview deployments
      (isDevelopment && origin.startsWith('http://localhost'));

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', postRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Public sitemap and robots (no auth required)
app.use('/sitemap.xml', sitemapRoutes);
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /explore
Allow: /public/

Disallow: /dashboard
Disallow: /rooms
Disallow: /login
Disallow: /register
Disallow: /api/

Sitemap: https://oddslab.com/sitemap.xml`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});
