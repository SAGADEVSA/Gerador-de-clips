import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import uploadRoutes from './controllers/upload';
import processRoutes from './controllers/process';
import videoRoutes from './controllers/videos';
import clipRoutes, { downloadClip } from './controllers/clips';
import authRoutes from './controllers/auth';

dotenv.config();

// If an explicit ffmpeg path is provided, configure fluent-ffmpeg to use it
if (process.env.FFMPEG_PATH) {
  try {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    console.log('Configured ffmpeg path from FFMPEG_PATH');
  } catch (e) {
    console.warn('Failed to set ffmpeg path:', e);
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/process', processRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/clips', clipRoutes);
app.get('/api/download/:clipId', downloadClip);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { io };

// Global error handler to log unhandled errors (including body-parser JSON errors)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const msg = `[${new Date().toISOString()}] ${err && err.stack ? err.stack : JSON.stringify(err)}\n`;
    fs.appendFileSync(path.join(logsDir, 'server_errors.log'), msg);
  } catch (e) {
    console.error('Failed to write server error log:', e);
  }
  // If headers already sent, delegate
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.IS_WORKER) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});