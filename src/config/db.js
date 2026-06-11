import mongoose from 'mongoose';
import dotenv from 'dotenv';

// env variables ko load karne ke liye
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1); // Agar DB connect nahi hua toh server band kar do
  }
};

export default connectDB;