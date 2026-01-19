import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, isDevelopment } from './config/config';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import otpRoutes from './routes/otp';
import roomRoutes from './routes/rooms';
import addressRoutes from './routes/addresses';
import postRoutes from './routes/posts';
import sitemapRoutes from './routes/sitemap';

const app = express();
const PORT = config.PORT;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', postRoutes);

// Public sitemap (no auth required)
app.use('/sitemap.xml', sitemapRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});
