import express, { Request, Response } from 'express';
import { prisma } from '../server';
import { addVideoProcessingJob } from '../queues/videoQueue';

const router = express.Router();

const processVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create processing job
    const job = await prisma.processingJob.create({
      data: {
        videoId
      }
    });

    // Add to queue
    await addVideoProcessingJob(videoId);

    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'processing' }
    });

    res.json({
      message: 'Video processing started',
      jobId: job.id
    });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ error: 'Failed to start video processing' });
  }
};

router.post('/', processVideo);

export default router;