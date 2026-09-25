import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import createCommentRoutes from './routes/comments.js';
import profileRoutes from './routes/profile.js';

const app = express();
const server = createServer(app);
const origin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, { cors: { origin } });

app.use(cors({ origin }));
app.use(express.json({ limit: '12mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', createCommentRoutes(io));
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    service: 'lead-tracker-api',
    realtime: true,
    googleAuth: Boolean(process.env.GOOGLE_CLIENT_ID)
  })
);

app.post('/api/demo/import', (req, res) => {
  const batchId = 'IMPORT-' + Date.now();
  res.status(202).json({ batchId, status: 'QUEUED' });

  let p = 0;
  const t = setInterval(() => {
    p += 10;
    io.emit('import:progress', {
      batchId,
      progress: p,
      status: p === 100 ? 'COMPLETED' : 'PROCESSING'
    });
    if (p === 100) clearInterval(t);
  }, 400);
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next();

  try {
    socket.user = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret'
    );
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', socket => {
  socket.emit('system:ready', { message: 'Realtime lead updates connected' });

  if (socket.user?.sub) {
    socket.join('user:' + socket.user.sub);
  }

  socket.on('join:import', batchId => socket.join('import:' + batchId));
});

const port = process.env.PORT || 5000;

async function start() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    } catch (e) {
      console.error('MongoDB unavailable:', e.message);
    }
  }

  server.listen(port, () => console.log('API + WebSocket server on ' + port));
}

start();
