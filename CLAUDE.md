# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Oddslab is a platform for tracking and curating "smart money" wallet addresses in Polymarket prediction markets. It allows users to create rooms, add Ethereum addresses to track, and view aggregated trading activities.

## Architecture

**Tech Stack:**
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- Frontend: React + Vite + TypeScript + Tailwind CSS + React Router
- Database: PostgreSQL (via Docker Compose)
- Authentication: JWT tokens

**Project Structure:**
```
oddslab/
├── backend/          # Express API server (port 3001)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (Polymarket integration)
│   │   └── utils/         # Validation helpers
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── docker-compose.yml # PostgreSQL setup
└── frontend/         # React SPA (port 5173)
    └── src/
        ├── pages/         # Page components
        ├── services/      # API client services
        ├── hooks/         # Custom React hooks
        └── utils/         # Helper functions
```

## Common Commands

### Backend Development

```bash
cd backend

# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server (port 3001)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server (port 5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Database Management

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Database Schema

**Models:**
- `User`: User accounts (email, password)
- `Room`: User-created collections of addresses (name, isPublic, userId)
- `Address`: Ethereum addresses tracked in rooms (address, roomId)

**Relationships:**
- User → Room (one-to-many)
- Room → Address (one-to-many, cascade delete)

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |

### Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rooms` | Yes | Create room |
| GET | `/api/rooms` | Yes | List user's rooms |
| GET | `/api/rooms/public/all` | No | List all public rooms |
| GET | `/api/rooms/:id` | Optional* | Get room details |
| DELETE | `/api/rooms/:id` | Yes | Delete room (owner only) |
| PATCH | `/api/rooms/:id/visibility` | Yes | Toggle public/private |
| GET | `/api/rooms/:roomId/activities` | Optional* | Get activity feed |

*Optional: Required for private rooms, not required for public rooms

### Addresses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/addresses/:roomId/addresses` | Yes | Add addresses to room |
| DELETE | `/api/addresses/:roomId/addresses/:addressId` | Yes | Remove address |
| GET | `/api/addresses/:roomId/addresses` | Yes | List addresses in room |

## Frontend Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page with Explore button | No |
| `/explore` | Browse all public rooms | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/dashboard` | User's rooms | Yes |
| `/rooms/:id` | Room detail (edit) | Yes |
| `/public/:id` | Public room view | No |

## Key Implementation Details

### Authentication Flow
1. User registers/logs in → receives JWT token
2. Token stored in localStorage on frontend
3. Token sent in Authorization header for protected routes
4. Backend middleware verifies token and attaches userId to request

### Auth Middleware
- `authMiddleware`: Requires valid JWT token, rejects if missing/invalid
- `optionalAuthMiddleware`: Sets userId if valid token provided, continues without if missing

### Address Validation
- Ethereum addresses must match format: `0x[40 hex characters]`
- Validation happens in `backend/src/utils/validation.ts`
- Duplicate addresses in same room are prevented via unique constraint

### Activity Feed
- Fetches trading activities from Polymarket API (currently mocked)
- Results cached for 60 seconds to avoid rate limits
- Activities sorted by timestamp (descending)
- Returns: address, type (buy/sell/redeem), market, amount, timestamp

### Public Sharing
- Rooms can be toggled between public and private
- Public rooms accessible via `/public/:roomId` route without login
- Private rooms only accessible by owner
- `/explore` page lists all public rooms

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oddslab"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Development Workflow

1. **Start Backend:**
   - Ensure Docker is running
   - Start PostgreSQL: `docker-compose up -d`
   - Run migrations: `npx prisma migrate dev`
   - Start server: `pnpm dev` (runs on port 3001)

2. **Start Frontend:**
   - In separate terminal: `cd frontend && pnpm dev`
   - Frontend runs on port 5173 by default

3. **Testing:**
   - Visit http://localhost:5173
   - Browse public rooms via Explore
   - Register a new user
   - Create a room
   - Add Ethereum addresses (use format: 0x + 40 hex chars)
   - View activity feed (currently shows mock data)
   - Toggle room to public and access via public link

## TypeScript Notes

- Use `import type { ... }` for type-only imports (required by verbatimModuleSyntax)
- Example: `import type { Room } from '../services/roomService';`

## Known Limitations (MVP)

- Email verification is mocked (logs to console)
- Polymarket API integration uses mock data
- No password reset functionality
- No activity filtering/sorting on frontend
- No room descriptions or tags
- No user profile editing

## Future Enhancements (Post-MVP)

- Real Polymarket API integration
- Activity filtering and sorting
- Room tags and descriptions
- User profile management
- Wallet-based authentication
- Subscription/payment system

## Troubleshooting

**Database connection errors:**
- Ensure PostgreSQL is running: `docker ps`
- Check DATABASE_URL in .env matches docker-compose.yml

**CORS errors:**
- Verify VITE_API_URL in frontend/.env
- Backend CORS is configured to allow all origins in development

**JWT errors:**
- Check JWT_SECRET is set in backend/.env
- Verify token is being sent in Authorization header

**Prisma errors:**
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations

**Port conflicts:**
- Backend default: 3001 (change PORT in .env)
- Frontend default: 5173 (Vite auto-selects next available)
