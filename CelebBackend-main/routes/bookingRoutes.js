const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

// Create a booking (auth required)
router.post('/', protect, bookingController.createBooking);

// Update a booking (auth required)
router.put('/:bookingId', protect, bookingController.updateBooking);

// Get bookings (auth required)
router.get('/', protect, bookingController.getBookings);

// Delete a booking
router.delete('/:bookingId', protect, bookingController.deleteBooking);

// Confirm a booking
router.patch('/:bookingId/confirm', protect, bookingController.confirmBooking);

// Cancel a booking
router.patch('/:bookingId/cancel', protect, bookingController.cancelBooking);

module.exports = router;
