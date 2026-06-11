import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true, index: true },
  email: { type: String, unique: true, sparse: true },
  profileImage: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  address: { type: String },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Geospatial indexing for tracking customer proximity
userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);