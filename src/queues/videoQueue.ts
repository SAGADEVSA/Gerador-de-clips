import { Queue, Worker } from 'bullmq';
import { processVideoClips } from '../services/videoProcessingService';
import { prisma, io } from '../server';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

const redisDisabled = process.env.REDIS_DISABLED === 'true';

let videoQueue: Queue | null = null;
let worker: Worker | null = null;

if (!redisDisabled) {
  videoQueue = new Queue('video-processing', { connection });

  worker = new Worker('video-processing', async (job) => {
    const { videoId } = job.data;

    try {
      await prisma.processingJob.updateMany({
        where: { videoId, status: 'pending' },
        data: { status: 'processing' }
      });

      io.emit('processing-progress', { videoId, progress: 10 });

      await processVideoClips(videoId);

      await prisma.processingJob.updateMany({
        where: { videoId, status: 'processing' },
        data: { status: 'completed' }
      });

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

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
}

const processJobLocally = async (videoId: string) => {
  try {
    await prisma.processingJob.updateMany({
      where: { videoId, status: 'pending' },
      data: { status: 'processing' }
    });

    io.emit('processing-progress', { videoId, progress: 10 });

    await processVideoClips(videoId);

    await prisma.processingJob.updateMany({
      where: { videoId, status: 'processing' },
      data: { status: 'completed' }
    });

    io.emit('processing-progress', { videoId, progress: 100 });
  } catch (error) {
    console.error('Local job failed:', error);

    await prisma.processingJob.updateMany({
      where: { videoId, status: 'processing' },
      data: {
        status: 'failed',
        error: (error as Error).message
      }
    });

    throw error;
  }
};

export const addVideoProcessingJob = async (videoId: string) => {
  if (redisDisabled || !videoQueue) {
    return processJobLocally(videoId);
  }

  await videoQueue.add('process-video', { videoId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

export { videoQueue, worker };
