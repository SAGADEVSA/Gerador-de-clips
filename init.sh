
#!/bin/bash

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start Docker services
docker-compose up -d db redis

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start the development server
npm run dev