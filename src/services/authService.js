import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';

// 1. Generate 6-digit OTP & store in Redis with 5-minute TTL (Time to live)
export const generateAndStoreOTP = async (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Secure 6 digit number
  const ttl = 300; // 5 minutes in seconds (SRS Section 13)
  
  // Redis me key-value pair save karo with expiry
  await redisClient.setEx(`otp:${mobile}`, ttl, otp);
  
  // Development mode ke liye console pe message print kar rahe hain
  console.log(`\n===================================`);
  console.log(`📩 [SMS Gateway Simulation]`);
  console.log(`Sending OTP [${otp}] to: +91 ${mobile}`);
  console.log(`===================================\n`);
  
  return otp;
};

// 2. Verify OTP from Redis Cache
export const verifyOTPFromCache = async (mobile, userOtp) => {
  const cachedOtp = await redisClient.get(`otp:${mobile}`);
  
  if (!cachedOtp || cachedOtp !== userOtp) {
    return false;
  }
  
  // CRITICAL SECURITY: OTP ek baar use hote hi delete (invalidate) ho jana chahiye
  await redisClient.del(`otp:${mobile}`);
  return true;
};

// 3. Generate Signed JWT for stateless sessions
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' // 7 days expiration (SRS Section 13)
  });
};