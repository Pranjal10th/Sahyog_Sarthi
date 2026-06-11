import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true, index: true },
  serviceCategory: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0.0 },
  totalRatings: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  isAvailable: { type: Boolean, default: false },
  kycStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  documents: [{ type: String }],
  walletBalance: { type: Number, default: 0 },
  hourlyRate: { type: Number, required: true },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// CRITICAL: Geospatial queries run karne ke liye index setup (SRS Step 2)
workerSchema.index({ location: '2dsphere' });

export default mongoose.model('Worker', workerSchema);