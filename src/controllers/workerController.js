import Worker from '../models/Worker.js';
import { getNearbyWorkersFromDB } from '../services/locationService.js';

// @desc    Toggle Worker Availability (Online/Offline)
// @route   PUT /api/v1/workers/:id/availability
export const toggleAvailability = async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  try {
    const worker = await Worker.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({ 
      success: true, 
      isAvailable: worker.isAvailable, 
      message: `Worker status updated to ${worker.isAvailable ? 'Online' : 'Offline'}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Nearby Workers based on Coordinates
// @route   GET /api/v1/workers/nearby
export const getNearbyWorkers = async (req, res) => {
  const { lng, lat, radius, category } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({ success: false, message: 'Longitude and Latitude query parameters are required' });
  }

  try {
    const defaultRadius = radius || 10000; // 10 KM default radius (SRS Section 5.2)
    const workers = await getNearbyWorkersFromDB(lng, lat, defaultRadius, category);

    res.status(200).json({ success: true, count: workers.length, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};