# Oddslab

A platform for tracking and curating "smart money" wallet addresses in Polymarket prediction markets.

## Features

- User authentication (email/password with JWT)
- Create and manage rooms (collections of wallet addresses)
- Add/remove Ethereum addresses to track
- View aggregated trading activities
- Public sharing of rooms
- Explore public rooms without login

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router
- **Database:** PostgreSQL (Docker)
- **Authentication:** JWT

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- pnpm (recommended) or npm

### Setup

```bash
# Clone and setup
cd oddslab

# Backend
cd backend
pnpm install
docker-compose up -d
npx prisma migrate dev
pnpm dev

# Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Project Structure

```
oddslab/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── docker-compose.yml
├── frontend/
│   └── src/
│       ├── pages/          # Page components
│       ├── services/       # API clients
│       └── hooks/          # React hooks
├── CLAUDE.md               # Development guide
└── README.md
```

---

## API Documentation

Base URL: `http://localhost:3001/api`

### Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <token>
```

---

### Auth Endpoints

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `400` - Email already exists or invalid input

---

#### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### Room Endpoints

#### Create Room

```http
POST /api/rooms
```

**Auth:** Required

**Request Body:**
```json
{
  "name": "My Smart Money Room"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "My Smart Money Room",
  "isPublic": false,
  "userId": "uuid",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

---

#### List User's Rooms

```http
GET /api/rooms
```

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "My Room",
    "isPublic": false,
    "userId": "uuid",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z",
    "addresses": [
      {
        "id": "uuid",
        "address": "0x1234567890123456789012345678901234567890",
        "roomId": "uuid",
        "createdAt": "2024-01-10T12:00:00.000Z"
      }
    ]
  }
]
```

---

#### Get All Public Rooms

```http
GET /api/rooms/public/all
```

**Auth:** Not required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Public Room",
    "isPublic": true,
    "userId": "uuid",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z",
    "addresses": [...]
  }
]
```

---

#### Get Room Details

```http
GET /api/rooms/:id
```

**Auth:** Optional (required for private rooms)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Room Name",
  "isPublic": true,
  "userId": "uuid",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z",
  "addresses": [
    {
      "id": "uuid",
      "address": "0x1234567890123456789012345678901234567890",
      "roomId": "uuid",
      "createdAt": "2024-01-10T12:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `403` - Access denied (private room, not owner)
- `404` - Room not found

---

#### Delete Room

```http
DELETE /api/rooms/:id
```

**Auth:** Required (owner only)

**Response:** `200 OK`
```json
{
  "message": "Room deleted successfully"
}
```

**Errors:**
- `403` - Access denied (not owner)
- `404` - Room not found

---

#### Toggle Room Visibility

```http
PATCH /api/rooms/:id/visibility
```

**Auth:** Required (owner only)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Room Name",
  "isPublic": true,
  "userId": "uuid",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

---

### Address Endpoints

#### Add Addresses to Room

```http
POST /api/addresses/:roomId/addresses
```

**Auth:** Required (room owner only)

**Request Body:**
```json
{
  "addresses": [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  ]
}
```

**Response:** `201 Created`
```json
[
  {
    "id": "uuid",
    "address": "0x1234567890123456789012345678901234567890",
    "roomId": "uuid",
    "createdAt": "2024-01-10T12:00:00.000Z"
  }
]
```

**Errors:**
- `400` - Invalid Ethereum address format
- `403` - Access denied
- `404` - Room not found

**Address Format:**
- Must start with `0x`
- Followed by exactly 40 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef12345678`

---

#### Remove Address from Room

```http
DELETE /api/addresses/:roomId/addresses/:addressId
```

**Auth:** Required (room owner only)

**Response:** `200 OK`
```json
{
  "message": "Address removed successfully"
}
```

---

#### List Addresses in Room

```http
GET /api/addresses/:roomId/addresses
```

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "address": "0x1234567890123456789012345678901234567890",
    "roomId": "uuid",
    "createdAt": "2024-01-10T12:00:00.000Z"
  }
]
```

---

### Activity Endpoints

#### Get Room Activities

```http
GET /api/rooms/:roomId/activities
```

**Auth:** Optional (required for private rooms)

**Response:** `200 OK`
```json
[
  {
    "address": "0x1234567890123456789012345678901234567890",
    "type": "buy",
    "market": "Will Trump win 2024?",
    "amount": 1500,
    "timestamp": "2024-01-10T12:00:00.000Z"
  },
  {
    "address": "0x1234567890123456789012345678901234567890",
    "type": "sell",
    "market": "Bitcoin above $100k by EOY?",
    "amount": 2000,
    "timestamp": "2024-01-10T11:00:00.000Z"
  }
]
```

**Activity Types:**
- `buy` - Purchase of outcome tokens
- `sell` - Sale of outcome tokens
- `redeem` - Redemption of winning tokens

---

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  rooms     Room[]
}

model Room {
  id        String    @id @default(uuid())
  name      String
  isPublic  Boolean   @default(false)
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses Address[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Address {
  id        String   @id @default(uuid())
  address   String
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([address, roomId])
}
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oddslab"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Frontend Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page | No |
| `/explore` | Browse public rooms | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/dashboard` | User's rooms | Yes |
| `/rooms/:id` | Room detail (edit) | Yes |
| `/public/:id` | Public room view | No |

---

## Error Response Format

All API errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## Known Limitations (MVP)

- Email verification is mocked
- Polymarket API integration uses mock data
- No password reset functionality
- No activity filtering/sorting
- No user profile editing

## Future Enhancements

- Real Polymarket API integration
- Activity filtering and sorting
- Room tags and descriptions
- Wallet-based authentication
- Subscription system

## License

MIT
