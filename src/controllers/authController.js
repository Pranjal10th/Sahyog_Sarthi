import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { generateAndStoreOTP, verifyOTPFromCache, generateToken } from '../services/authService.js';

// @desc    Send OTP to Mobile Number
// @route   POST /api/v1/auth/send-otp
export const sendOTP = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
  }

  try {
    await generateAndStoreOTP(mobile);
    res.status(200).json({ success: true, message: 'OTP sent successfully (Check server console)' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP & Login/Register Customer
// @route   POST /api/v1/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { mobile, otp, name } = req.body; 

  try {
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required fields' });
    }

    const isValid = await verifyOTPFromCache(mobile, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check karo user pehle se registered hai ya nahi
    let user = await User.findOne({ mobile });

    if (!user) {
      // Agar pehli baar aa raha hai aur naam nahi diya
      if (!name) {
        return res.status(200).json({ 
          success: true, 
          newUser: true, 
          message: 'OTP Verified. Please provide name to complete profile registration.' 
        });
      }
      // Naya customer register karo (SRS FR-01)
      user = await User.create({ mobile, name });
    }

    // Stateless JWT Session token generate karo (SRS FR-03)
    const token = generateToken(user._id, 'customer');
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register Worker with Details & Initial Location
// @route   POST /api/v1/auth/register/worker
export const registerWorker = async (req, res) => {
  const { name, mobile, serviceCategory, experience, hourlyRate, coordinates } = req.body;

  try {
    let workerExists = await Worker.findOne({ mobile });
    if (workerExists) {
      return res.status(400).json({ success: false, message: 'Worker already registered with this mobile number' });
    }

    if (!coordinates || !coordinates.lng || !coordinates.lat) {
      return res.status(400).json({ success: false, message: 'Coordinates [lng, lat] are required for worker location setup' });
    }

    // Create worker entry with GeoJSON specification (SRS FR-02)
    const worker = await Worker.create({
      name,
      mobile,
      serviceCategory,
      experience,
      hourlyRate,
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat] // GeoJSON format: [longitude, latitude]
      },
      kycStatus: 'pending' // Initial state before Admin approval
    });

    const token = generateToken(worker._id, 'worker');
    res.status(201).json({ 
      success: true, 
      token, 
      worker, 
      message: 'Worker registration successful. KYC is pending validation.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};