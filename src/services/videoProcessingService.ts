import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { prisma } from '../server';
import { getVideoDuration } from '../utils/ffmpegUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const extractAudio = (videoPath: string, audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .audioCodec('libmp3lame')
      .audioChannels(1)
      .audioFrequency(16000)
      .output(audioPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
};

export const transcribeAudio = async (audioPath: string): Promise<string> => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
  });
  return transcription.text;
};

export const analyzeContent = async (transcription: string): Promise<any[]> => {
  const prompt = `
  Analyze the following video transcription and identify the most viral moments for short-form video clips (TikTok/YouTube Shorts).
  Return a JSON array of objects with the following structure:
  [
    {
      "start": number (start time in seconds),
      "end": number (end time in seconds, max 60 seconds),
      "score": number (0-10, viral potential score),
      "title": string (suggested title for the clip),
      "hook": string (attention-grabbing hook for the clip)
    }
  ]
  Focus on moments with high engagement potential, emotional peaks, surprising elements, or educational value.
  Limit to top 5-10 clips.

  Transcription: ${transcription}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '[]');
};

export const createClip = (
  videoPath: string,
  outputPath: string,
  start: number,
  end: number,
  title: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const duration = end - start;

    ffmpeg(videoPath)
      .setStartTime(start)
      .setDuration(duration)
      .size('1080x1920') // 9:16 aspect ratio
      .aspect('9:16')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 22',
        '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
};

export const processVideoClips = async (videoId: string) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!video) throw new Error('Video not found');

    const audioPath = path.join(path.dirname(video.filePath), `audio-${videoId}.mp3`);

    // Extract audio
    await extractAudio(video.filePath, audioPath);

    // Transcribe + Analyze with AI. If OpenAI fails, fall back to a simple clip selection
    let clipsData: any[] = [];
    try {
      const transcription = await transcribeAudio(audioPath);
      clipsData = await analyzeContent(transcription);
    } catch (aiError) {
      console.error('AI analysis/transcription failed, falling back to generated clips:', aiError);
      // Fallback: generate up to N clips of fixed length evenly spaced across the video
      try {
        const duration = await getVideoDuration(video.filePath).catch(() => 60);
        const clipLength = 15; // seconds
        const maxClips = 3;
        const possibleCount = Math.max(1, Math.floor(duration / clipLength));
        const count = Math.min(maxClips, possibleCount);

        if (count <= 0) {
          clipsData = [{ start: 0, end: Math.min(15, duration || 15), score: 1, title: 'Fallback clip', hook: '' }];
        } else {
          if (count === 1) {
            clipsData = [{ start: 0, end: Math.min(clipLength, duration || clipLength), score: 1, title: 'Fallback clip', hook: '' }];
          } else {
            const interval = (Math.max(duration, clipLength) - clipLength) / (count - 1 || 1);
            clipsData = [];
            for (let i = 0; i < count; i++) {
              const start = Math.max(0, Math.round(i * interval));
              const end = Math.min(start + clipLength, Math.round(duration));
              clipsData.push({ start, end, score: 1, title: `Fallback clip ${i + 1}`, hook: '' });
            }
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback clip generation failed, using single clip:', fallbackErr);
        clipsData = [{ start: 0, end: 15, score: 1, title: 'Fallback clip', hook: '' }];
      }
    }

    // Create clips
    for (const clipData of clipsData) {
      const clipId = uuidv4();
      const outputPath = path.join(__dirname, '../../uploads/clips', `clip-${clipId}.mp4`);

      // Ensure clips directory exists
      const clipsDir = path.dirname(outputPath);
      if (!fs.existsSync(clipsDir)) {
        fs.mkdirSync(clipsDir, { recursive: true });
      }

      await createClip(video.filePath, outputPath, clipData.start, clipData.end, clipData.title);

      // Save to database
      await prisma.clip.create({
        data: {
          videoId,
          start: clipData.start,
          end: clipData.end,
          score: clipData.score,
          title: clipData.title,
          hook: clipData.hook,
          fileUrl: outputPath
        }
      });
    }

    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'completed' }
    });

    // Clean up audio file
    fs.unlinkSync(audioPath);

  } catch (error) {
    console.error('Video processing error:', error);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'failed' }
    });
    throw error;
  }
};