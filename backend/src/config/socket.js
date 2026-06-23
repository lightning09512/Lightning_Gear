const { Server } = require('socket.io');
require('dotenv').config();

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins their personal room for notifications
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined room user:${userId}`);
    });

    // Admin joins the admin room
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`🔧 Admin joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io initialized');
  return io;
}

/**
 * Get the Socket.io instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
}

module.exports = { initSocket, getIO };
