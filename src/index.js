import dotenv from 'dotenv';
// CRITICAL: dotenv ko sabse pehle config karna hai taaki baki modules ko env variables mil sakein
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import redisClient from './config/redis.js'; // Redis client ko inject kiya OTP store ke liye
import authRoutes from './routes/authRoutes.js'; // Auth endpoints ke routes import kiye

// Express app initialize karo
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Taaki hum incoming JSON payload data read kar sakein

// Connect to MongoDB Database
connectDB();

// API Routes Mapping (SRS Section 9.1)
app.use('/api/v1/auth', authRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Sahayog Sarthi API is running smoothly...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Server listening on port ${PORT}`);
});