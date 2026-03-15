const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.user;
    console.log(`🔌 Socket connected: user=${userId} role=${role}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`   user=${userId} joined conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: user=${userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized.');
  return io;
}

module.exports = { initSocket, getIO };
