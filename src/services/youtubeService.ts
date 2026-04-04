import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

// Use yt-dlp binary (installed on the system) to download YouTube videos.
export const downloadYouTubeVideo = async (url: string) => {
  const uniqueId = uuidv4();
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${uniqueId}.mp4`);

  // Determine yt-dlp executable path with environment variable fallback
  const envPath = process.env.YTDLP_PATH;
  const winGetPath = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe', 'yt-dlp.exe');
  let ytDlpCmd = 'yt-dlp';
  if (envPath && fs.existsSync(envPath)) {
    ytDlpCmd = envPath;
  } else if (fs.existsSync(winGetPath)) {
    ytDlpCmd = winGetPath;
  } else {
    ytDlpCmd = 'yt-dlp';
  }

  // Helper to run a command and capture stdout
  const runCommand = (cmd: string, args: string[]) => new Promise<string>((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', (chunk) => out += chunk.toString());
    proc.stderr.on('data', (chunk) => err += chunk.toString());
    proc.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`Command failed (${cmd} ${args.join(' ')}): ${err || out}`));
    });
    proc.on('error', reject);
  });

  try {
    // Get title first
    let title = '';
    try {
      title = await runCommand(ytDlpCmd, ['--get-title', url]);
    } catch (e) {
      // ignore title fetch failure
      title = '';
    }

    // Download best audio+video into filePath
    // Use -f best to get best quality and -o to specify output
    await runCommand(ytDlpCmd, ['-f', 'best', '-o', filePath, url]);

    return { filePath, title };
  } catch (error) {
    throw new Error(`Failed to download YouTube video: ${error instanceof Error ? error.message : String(error)}`);
  }
};