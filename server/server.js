// server/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Socket.IO Server
const db = require('./db'); // Initialize database connection

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');
const adminRoutes = require('./routes/admin'); // NEW: Admin routes

const app = express();
const server = http.createServer(app); // Create HTTP server for Express and Socket.IO
const io = new Server(server, { // Initialize Socket.IO server
  cors: {
    origin: "http://localhost:5173", // Allow frontend origin (Vite default)
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000; // Use port 5000 or from .env

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Body parser for JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/admin', adminRoutes); // NEW: Admin routes

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // Example: Join a room based on user ID for private notifications
  // This allows us to send targeted notifications to specific users
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected via WebSocket:', socket.id);
  });
});

// Make io accessible globally or pass it to routes if needed for emitting events
// This allows your routes (e.g., swap status update) to emit real-time events
app.set('io', io);

// Basic root route
app.get('/', (req, res) => {
  res.send('Skill Swap Backend API is running!');
});

// Start the server
server.listen(PORT, () => { // Listen with the HTTP server, not just Express app
  console.log(`Server running on port ${PORT}`);
});

