import express, { Request, Response } from 'express';
import { prisma } from '../server';
import path from 'path';

const router = express.Router();

const getClips = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const clips = await prisma.clip.findMany({
      where: { videoId },
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
      where: { id: clipId }
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
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

export default router;