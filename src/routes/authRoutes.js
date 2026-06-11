import express from 'express';
import { sendOTP, verifyOTP, registerWorker } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register/worker', registerWorker);

export default router;