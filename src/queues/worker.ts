process.env.IS_WORKER = 'true';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

if (process.env.FFMPEG_PATH) {
	try {
		ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
		console.log('Worker configured ffmpeg path from FFMPEG_PATH');
	} catch (e) {
		console.warn('Worker failed to set ffmpeg path:', e);
	}
}

import './videoQueue';