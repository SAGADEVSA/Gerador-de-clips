import { Queue, Worker } from 'bullmq';
import { processVideoClips } from '../services/videoProcessingService';
import { prisma, io } from '../server';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

export const videoQueue = new Queue('video-processing', { connection });

export const addVideoProcessingJob = async (videoId: string) => {
  await videoQueue.add('process-video', { videoId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

// Worker to process jobs
const worker = new Worker('video-processing', async (job) => {
  const { videoId } = job.data;

  try {
    // Update job status
    await prisma.processingJob.updateMany({
      where: { videoId, status: 'pending' },
      data: { status: 'processing' }
    });

    // Emit progress
    io.emit('processing-progress', { videoId, progress: 10 });

    await processVideoClips(videoId);

    // Update job status
    await prisma.processingJob.updateMany({
      where: { videoId, status: 'processing' },
      data: { status: 'completed' }
    });

    // Emit completion
    io.emit('processing-progress', { videoId, progress: 100 });

  } catch (error) {
    console.error('Job failed:', error);

    await prisma.processingJob.updateMany({
      where: { videoId, status: 'processing' },
      data: {
        status: 'failed',
        error: (error as Error).message
      }
    });

    throw error;
  }
}, { connection });

// Event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});