require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;
const ytDlpCommand = process.env.YT_DLP_COMMAND || (process.platform === 'win32' ? 'py' : 'yt-dlp');
const ytDlpJsRuntime = process.env.YT_DLP_JS_RUNTIME || 'node';
const ytDlpCookies = process.env.YT_DLP_COOKIES;
const downloadsDirectory = path.resolve(process.env.DOWNLOAD_DIR || path.join(__dirname, 'downloads'));

fs.mkdirSync(downloadsDirectory, { recursive: true });

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function isYouTubeUrl(value) {
  try {
    const url = new URL(value);
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname);
  } catch {
    return false;
  }
}

app.post('/api/download', (request, response) => {
  const { url } = request.body || {};

  if (!isYouTubeUrl(url)) {
    return response.status(400).json({ error: 'Enter a valid YouTube URL.' });
  }

  const outputName = `youtube-download-${Date.now()}.mp3`;
  const ytDlpArgs = process.platform === 'win32' && !process.env.YT_DLP_COMMAND ? ['-m', 'yt_dlp'] : [];
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'clipwell-'));
  const outputTemplate = path.join(tempDirectory, 'download.%(ext)s');
  const outputArgs = [
    '--no-playlist',
    '--js-runtimes',
    ytDlpJsRuntime,
    ...(ytDlpCookies ? ['--cookies', ytDlpCookies] : []),
    '-x',
    '--audio-format',
    'mp3',
    '--audio-quality',
    '0',
    '-o',
    outputTemplate,
    url,
  ];

  const downloader = spawn(ytDlpCommand, [...ytDlpArgs, ...outputArgs], { windowsHide: true });
  let errorOutput = '';

  downloader.stderr.on('data', (chunk) => {
    errorOutput += chunk.toString();
  });

  downloader.on('error', (error) => {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
    if (!response.headersSent) {
      response.status(500).json({ error: 'yt-dlp was not found. Install it with `py -m pip install yt-dlp`.' });
    }
  });

  downloader.on('close', (code) => {
    if (code === 0) {
      const outputFile = fs.readdirSync(tempDirectory)
        .map((fileName) => path.join(tempDirectory, fileName))
        .find((filePath) => fs.statSync(filePath).isFile());

      if (outputFile) {
        const savedFile = path.join(downloadsDirectory, outputName);
        fs.renameSync(outputFile, savedFile);
        fs.rmSync(tempDirectory, { recursive: true, force: true });
        return response.json({ message: 'Download saved.', fileName: outputName });
      }
    }

    fs.rmSync(tempDirectory, { recursive: true, force: true });
    if (!response.headersSent) {
      response.status(502).json({ error: errorOutput.trim() || 'The download could not be completed.' });
    }
  });

  request.on('close', () => {
    if (!request.complete) {
      downloader.kill();
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});

app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`YouTube downloader running at http://localhost:${port}`);
});
