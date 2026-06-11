import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // Native Node server connector
import connectDB from './config/db.js';
import cacheEngine from './config/redis.js'; 
import { initSocket } from './config/socket.js'; // Socket setup import kiya

import authRoutes from './routes/authRoutes.js'; 
import workerRoutes from './routes/workerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();
const httpServer = createServer(app); // Upgrading express into native HTTP layer

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Databases
connectDB();
initSocket(httpServer); // Mounting Socket.io server layer over HTTP

// API Routes Mapping
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Sahayog Sarthi API is running smoothly with real-time sockets...');
});

const PORT = process.env.PORT || 5000;
// CRITICAL FIX: Ab app.listen ki jagah httpServer.listen use karenge taaki sockets active rahein!
httpServer.listen(PORT, () => {
  console.log(`📡 Real-time HTTP & Socket Server listening on port ${PORT}`);
});