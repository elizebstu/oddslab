#!/bin/bash

echo "🚀 Setting up Oddslab MVP..."

# Backend setup
echo "\n📦 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  pnpm install
fi

echo "Starting PostgreSQL..."
docker-compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Generating Prisma client..."
npx prisma generate

# Frontend setup
echo "\n📦 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  pnpm install
fi

echo "\n✅ Setup complete!"
echo "\nTo start the application:"
echo "1. Backend:  cd backend && pnpm dev"
echo "2. Frontend: cd frontend && pnpm dev"
echo "\nThen open http://localhost:5173 in your browser"
