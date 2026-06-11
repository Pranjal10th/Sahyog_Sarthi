import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import { emitRealTimeEvent } from '../config/socket.js'; // Real-time emitter trigger import kiya

// @desc    Create a New Booking (Customer requests a worker)
// @route   POST /api/v1/bookings
export const createBooking = async (req, res) => {
  const { customerId, workerId, serviceType, amount, customerAddress, notes } = req.body;

  try {
    // Check karo ki worker sach me exist karta hai aur online hai
    const worker = await Worker.findById(workerId);
    if (!worker || !worker.isAvailable) {
      return res.status(400).json({ success: false, message: 'Worker is currently unavailable or not found' });
    }

    // Naya booking record create karo (Default status: 'pending')
    const booking = await Booking.create({
      customerId,
      workerId,
      serviceType,
      amount,
      customerAddress,
      notes
    });

    // 🔥 REAL-TIME SOCKET EMIT: Worker ko instantly alert/notification bhej rahe hain!
    emitRealTimeEvent(workerId, 'new_booking_request', {
      bookingId: booking._id,
      customerAddress,
      serviceType,
      amount,
      notes
    });

    res.status(201).json({ 
      success: true, 
      booking, 
      message: 'Booking request placed successfully. Alert sent to worker via socket.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Booking Status (Worker accepts/completes job)
// @route   PATCH /api/v1/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status can be: 'accepted', 'in_progress', 'completed', 'cancelled'

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking entry not found' });
    }

    // State update logic
    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = Date.now();
      booking.paymentStatus = 'paid'; // Simulating direct cash or wallet pay on completion
    }

    await booking.save();

    // 💡 OPTIONAL REAL-TIME ALERT: Customer ko status update ka notification bhej sakte hain
    emitRealTimeEvent(booking.customerId, 'booking_status_updated', {
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus
    });

    res.status(200).json({ 
      success: true, 
      booking, 
      message: `Booking status updated successfully to [${status}]` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};