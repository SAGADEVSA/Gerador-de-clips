import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server';
import { downloadYouTubeVideo } from '../services/youtubeService';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { youtubeUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be authenticated to upload videos' });
    }

    let filePath: string;
    let title: string | undefined;

    if (youtubeUrl) {
      // Download from YouTube
      const downloadResult = await downloadYouTubeVideo(youtubeUrl);
      filePath = downloadResult.filePath;
      title = downloadResult.title;
    } else if (req.file) {
      // Uploaded file
      filePath = req.file.path;
      title = req.file.originalname;
    } else {
      return res.status(400).json({ error: 'No video file or YouTube URL provided' });
    }

    // Save to database
    const video = await prisma.video.create({
      data: {
        userId,
        title,
        originalUrl: youtubeUrl || null,
        filePath
      }
    });

    res.json({
      message: 'Video uploaded successfully',
      videoId: video.id
    });
  } catch (error) {
    console.error('Upload error:', error);
    try {
      const logsDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      const msg = `[${new Date().toISOString()}] Upload error: ${error instanceof Error ? error.stack : JSON.stringify(error)}\n`;
      fs.appendFileSync(path.join(logsDir, 'upload_errors.log'), msg);
    } catch (logErr) {
      console.error('Failed to write upload log:', logErr);
    }
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

router.post('/', upload.single('video'), uploadVideo);

export default router;