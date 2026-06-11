import express from 'express';
import { toggleAvailability, getNearbyWorkers } from '../controllers/workerController.js';

const router = express.Router();

// Geospatial search standard public endpoint
router.get('/nearby', getNearbyWorkers);

// Status modifier endpoint
router.put('/:id/availability', toggleAvailability);

export default router;