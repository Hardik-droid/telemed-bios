import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import sqlite3 from "sqlite3";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// === DATABASE ===
// ... (Lines 1-15 are unchanged)

// === DATABASE ===
// FIX: Correctly instantiate the Database constructor using 'new'
const db = new (sqlite3.verbose().Database)('./myhealth.db'); 
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE, name TEXT, biometric_template TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS transcripts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, text TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
});

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// Resolve __dirname in ES modules (keep this part)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Expose the assets from the WebRTC repository's 'public' folder
const WEBRTC_PUBLIC_PATH = join(__dirname, 'rizwan17/webrtc-video-calling-app/webrtc-video-calling-app-59749bd76f2a817e712bfb7a9d51b8c09c28b393/public');
app.use(express.static(WEBRTC_PUBLIC_PATH));

// 2. Expose the assets from the current directory (where your index.html lives)
// 2. Expose the project's frontend `public` folder (telemed-frontend/public)
//    so the backend serves the frontend's static files.
const FRONTEND_PUBLIC_PATH = join(__dirname, '..', 'telemed-frontend', 'public');
app.use(express.static(FRONTEND_PUBLIC_PATH));

// Serve frontend index.html for the root path
app.get('/', (req, res) => {
  console.log('Serving frontend index.html from', FRONTEND_PUBLIC_PATH);
  res.sendFile(join(FRONTEND_PUBLIC_PATH, 'index.html'));
});

// Fallback for SPA client-side routing: send index.html for any unknown route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(join(FRONTEND_PUBLIC_PATH, 'index.html'));
});

// === VIDEO CALL: SOCKET.IO LOGIC ===
const allusers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-user", (username) => {
    console.log(`${username} joined (Socket ID: ${socket.id})`);
    allusers[username] = { username, id: socket.id };
    io.emit("joined", allusers); // Update all clients
  });

  socket.on("offer", ({ from, to, offer }) => {
    console.log(`Offer from ${from} → ${to || 'broadcast'}`);
    if (to) {
      if (allusers[to]) {
        io.to(allusers[to].id).emit("offer", { from, to, offer });
      }
    } else {
      // No specific recipient: broadcast to all other connected clients
      socket.broadcast.emit("offer", { from, offer });
    }
  });

  socket.on("answer", ({ from, to, answer }) => {
    if (allusers[from]) {
      io.to(allusers[from].id).emit("answer", { from, to, answer });
    }
  });

  socket.on("end-call", ({ from, to }) => {
    if (allusers[to]) io.to(allusers[to].id).emit("end-call", { from, to });
    if (allusers[from]) io.to(allusers[from].id).emit("end-call", { from, to });
  });

  socket.on("icecandidate", (candidate) => {
    socket.broadcast.emit("icecandidate", candidate);
  });

  socket.on("disconnect", () => {
    for (const username in allusers) {
      if (allusers[username].id === socket.id) {
        console.log(`${username} disconnected`);
        delete allusers[username];
        io.emit("joined", allusers);
        break;
      }
    }
  });
});

// === REST API ROUTES (Your Original MyHealth Backend) ===

app.post('/api/register', (req, res) => {
  const { phone, name } = req.body;
  db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
    if (row) return res.json({ success: true, user: { id: row.id, name: row.name } });
    db.run('INSERT INTO users (phone, name) VALUES (?, ?)', [phone, name], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, user: { id: this.lastID, name } });
    });
  });
});

app.post('/api/transcripts', (req, res) => {
  const { user_id, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Empty transcript" });

  db.run('INSERT INTO transcripts (user_id, text) VALUES (?, ?)', [user_id, text], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const transcript = { id: this.lastID, text, timestamp: new Date().toISOString() };
    
    // Notify doctors via Socket.IO
    io.emit("new-transcript", { user_id, text });

    res.json({ success: true, transcript });
  });
});

app.post('/api/sos', (req, res) => {
  const { user_id, location } = req.body;
  io.emit("sos-alert", { user_id, location, time: new Date() });
  res.json({ success: true });
});

app.get('/api/transcripts/:user_id', (req, res) => {
  db.all('SELECT * FROM transcripts WHERE user_id = ? ORDER BY timestamp DESC', [req.params.user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Webhooks removed: no external notification will be sent from server

app.get('/api/health', (req, res) => res.json({ status: "MyHealth Server Running", time: new Date() }));

// === START SERVER ===
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`MyHealth + Video Call Server Running on http://localhost:${PORT}`);
  console.log(`Socket.IO Ready | Video Calls Active`);
  // Webhooks removed
});