import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// 1. Expose the assets from the WebRTC repository's 'public' folder
const WEBRTC_PUBLIC_PATH = join(
  __dirname,
  'rizwan17/webrtc-video-calling-app/webrtc-video-calling-app-59749bd76f2a817e712bfb7a9d51b8c09c28b393/public'
);
app.use(express.static(WEBRTC_PUBLIC_PATH));

// 2. Expose the assets from the current directory (where your index.html lives)
app.use(express.static(__dirname));

// Serve frontend from the root directory
app.get('/', (req, res) => {
  console.log('Serving index.html from root directory.');
  res.sendFile(join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});