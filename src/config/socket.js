import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // Active connections track karne ke liye (userId -> socketId)

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST', 'PATCH', 'PUT']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected to Socket Gateway: ${socket.id}`);

    // Robust handler jo objects aur raw strings dono ko parse kar sake
    socket.on('join_session', (data) => {
      let parsedData = data;
      
      // Agar browser client ne JSON ko string bana kar bheja ho
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          console.log('⚠️ Failed to parse string socket data');
        }
      }

      const { userId, role } = parsedData || {};

      if (userId) {
        socket.join(userId);
        userSockets.set(userId, socket.id);
        console.log(`👤 User [${userId}] with role [${role}] registered on socket channel.`);
      } else {
        console.log('⚠️ join_session received but userId is missing in payload:', data);
      }
    });

    socket.on('disconnect', () => {
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`🔌 User [${userId}] disconnected.`);
          break;
        }
      }
    });
  });

  return io;
};

export const emitRealTimeEvent = (targetUserId, eventName, payload) => {
  if (io) {
    io.to(targetUserId).emit(eventName, payload);
    console.log(`📡 Real-time event [${eventName}] fired directly to user: ${targetUserId}`);
  }
};