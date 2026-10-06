require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB, getStatus } = require('./config/db');
const { seedInitialData } = require('./seedData');
const { registerGameSockets } = require('./sockets/gameSocket');

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    return callback(null, true); // Dev-friendly permissive origin
  },
  credentials: true
}));

app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Register real-time game socket handlers
registerGameSockets(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'V-Quiz Real-Time Multiplayer Engine',
    timestamp: new Date(),
    database: getStatus() ? 'MongoDB Connected' : 'Standalone Adaptive Mode',
    socketClients: io.engine.clientsCount
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 V-Quiz Server running on port ${PORT}`);
    console.log(`📡 Socket.io Real-Time Engine Active`);
    console.log(`⚡ API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();
