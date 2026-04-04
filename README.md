# ClipForge AI Backend

Backend API for ClipForge AI - AI-powered video clipping for TikTok and YouTube Shorts.

## Features

- Video upload (local files or YouTube URLs)
- Automatic video processing with AI
- Clip generation for short-form content
- Real-time processing updates via WebSocket
- PostgreSQL database with Prisma ORM
- Redis-based job queue with BullMQ

## Tech Stack

- Node.js
- Express.js
- TypeScript
- FFmpeg
- OpenAI API (Whisper + GPT-4)
- yt-dlp (via ytdl-core)
- Multer (file uploads)
- BullMQ (job queue)
- Redis
- PostgreSQL
- Prisma ORM
- Socket.io

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Update `.env` with your configuration
5. Start Docker services: `docker-compose up -d db redis`
6. Run database migrations: `npm run prisma:migrate`
7. Generate Prisma client: `npm run prisma:generate`
8. Start development server: `npm run dev`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS

## API Endpoints

- `POST /api/upload` - Upload video file or provide YouTube URL
- `POST /api/process` - Start video processing
- `GET /api/videos` - Get user's videos
- `GET /api/clips/:videoId` - Get clips for a video
- `GET /api/download/:clipId` - Download a clip

## Development

- `npm run build` - Build TypeScript
- `npm run dev` - Start development server with hot reload
- `npm run queue:worker` - Start queue worker
- `npm run prisma:studio` - Open Prisma Studio

## Docker

Build and run with Docker Compose:

```bash
docker-compose up --build
```

## License

MIT