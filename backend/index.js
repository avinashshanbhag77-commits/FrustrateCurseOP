import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { pingRedis, redis } from './redisClient.js';
import prisma from './prismaClient.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============ QUEUE MANAGEMENT ============
const QUEUE_KEY = 'matchmaking:queue';
const ACTIVE_ROOMS_KEY = 'rooms:active';

app.get('/api/health', async (_req, res) => {
  const redisOk = await pingRedis();
  res.json({
    ok: true,
    message: 'RationalRage backend is online',
    redis: redisOk ? 'ok' : 'unavailable',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/rules', (_req, res) => {
  res.json({
    rules: [
      'Start every conversation by saying Hi',
      'End every conversation by saying Bye, it was nice talking to you.',
      'Stay anonymous and keep the room private',
    ],
  });
});

// ============ QUEUE ENDPOINTS ============

// Join public queue
app.post('/api/queue/join', async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) return res.status(400).json({ error: 'Nickname required' });

    // Get current queue length
    const queueLength = await redis.llen(QUEUE_KEY);

    if (queueLength > 0) {
      // Match with existing user
      const partner = await redis.lpop(QUEUE_KEY);
      const roomCode = uuidv4().substring(0, 6).toUpperCase();

      // Create room in database
      await prisma.room.create({
        data: {
          code: roomCode,
          isPrivate: false,
          sessions: {
            create: [
              { nickname: partner, duration: 0, messages: 0 },
              { nickname, duration: 0, messages: 0 },
            ],
          },
        },
      });

      // Store in Redis
      await redis.setex(`room:${roomCode}`, 3600, JSON.stringify({
        code: roomCode,
        users: [partner, nickname],
        createdAt: new Date(),
        messages: [],
      }));

      res.json({
        matched: true,
        roomCode,
        partner,
        message: `Matched with ${partner}!`,
      });
    } else {
      // Add to queue
      await redis.rpush(QUEUE_KEY, nickname);
      res.json({
        matched: false,
        message: `${nickname} added to queue. Waiting for a match...`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ROOM ENDPOINTS ============

// Create private room
app.post('/api/rooms/create', async (req, res) => {
  try {
    const { nickname } = req.body;
    const roomCode = uuidv4().substring(0, 6).toUpperCase();

    const room = await prisma.room.create({
      data: {
        code: roomCode,
        isPrivate: true,
        sessions: {
          create: [{ nickname, duration: 0, messages: 0 }],
        },
      },
    });

    await redis.setex(`room:${roomCode}`, 3600, JSON.stringify({
      code: roomCode,
      users: [nickname],
      createdAt: new Date(),
      messages: [],
    }));

    res.json({ roomCode, room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Join private room
app.post('/api/rooms/join', async (req, res) => {
  try {
    const { roomCode, nickname } = req.body;
    if (!roomCode || !nickname) {
      return res.status(400).json({ error: 'Room code and nickname required' });
    }

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { sessions: true },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Add user to session
    await prisma.session.create({
      data: {
        roomId: room.id,
        nickname,
        duration: 0,
        messages: 0,
      },
    });

    res.json({ success: true, room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get room details
app.get('/api/rooms/:code', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { code: req.params.code },
      include: {
        sessions: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MESSAGE ENDPOINTS ============

app.post('/api/messages', async (req, res) => {
  try {
    const { roomCode, sender, text } = req.body;
    if (!roomCode || !sender || !text) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const message = await prisma.message.create({
      data: { roomId: room.id, sender, text },
    });

    // Broadcast via WebSocket
    io.to(`room:${roomCode}`).emit('newMessage', message);

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STATS & LEADERBOARD ============

app.get('/api/leaderboard', async (_req, res) => {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: { rankScore: 'desc' },
      take: 50,
    });
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:nickname', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { nickname: req.params.nickname },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const leaderboardEntry = await prisma.leaderboard.findUnique({
      where: { nickname: req.params.nickname },
    });

    res.json({ ...user, leaderboard: leaderboardEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WEBSOCKET ============

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (data) => {
    const { roomCode } = data;
    socket.join(`room:${roomCode}`);
    socket.to(`room:${roomCode}`).emit('userJoined', { userId: socket.id });
  });

  socket.on('message', (data) => {
    const { roomCode, sender, text } = data;
    io.to(`room:${roomCode}`).emit('newMessage', {
      sender,
      text,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`RationalRage backend running on http://localhost:${PORT}`);
});
