import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

// Ensure required environment variables are set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
