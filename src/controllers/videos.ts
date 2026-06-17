import express, { Request, Response } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);


const getVideos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const videos = await prisma.video.findMany({
      where: { userId },
      include: {
        clips: true,
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

const getVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        clips: true,
        jobs: true
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (req.user && video.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

router.get('/', getVideos);
router.get('/:id', getVideo);

export default router;