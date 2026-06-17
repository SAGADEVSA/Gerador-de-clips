import express, { Request, Response } from 'express';
import { prisma } from '../server';
import path from 'path';
import { optionalAuthenticate } from '../middleware/auth';

const router = express.Router();
router.use(optionalAuthenticate);

const getClips = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    const clips = await prisma.clip.findMany({
      where: userId
        ? { videoId, video: { userId } }
        : { videoId },
      orderBy: { score: 'desc' }
    });

    res.json(clips);
  } catch (error) {
    console.error('Get clips error:', error);
    res.status(500).json({ error: 'Failed to fetch clips' });
  }
};

const downloadClip = async (req: Request, res: Response) => {
  try {
    const { clipId } = req.params;

    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
      include: { video: true }
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    if (req.user && clip.video.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filePath = path.resolve(clip.fileUrl);
    res.download(filePath, `clip-${clipId}.mp4`);
  } catch (error) {
    console.error('Download clip error:', error);
    res.status(500).json({ error: 'Failed to download clip' });
  }
};

router.get('/:videoId', getClips);
router.get('/download/:clipId', downloadClip);

export { downloadClip };
export default router;