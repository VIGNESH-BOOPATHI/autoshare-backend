const express = require('express');
const bookingController = require('../controllers/bookingController'); // Import the booking controller
const authenticateToken = require('../middleware/auth'); // JWT authentication middleware
const checkRole = require('../middleware/role'); // Role-based access control

const router = express.Router(); // Create a new router instance

// Route to create a new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Route for admin-level access to list all bookings in the system
router.get('/all', authenticateToken, checkRole("admin"), bookingController.listAllBookings); 

// Route to get a booking by ID
router.get('/:id', authenticateToken, bookingController.getBookingById);

// Route to list all bookings for a specific user
router.get('/', authenticateToken, bookingController.listBookings);

// Route to update a booking
router.put('/:id', authenticateToken, bookingController.updateBooking);

// Route to delete a booking
router.delete('/:id', authenticateToken, bookingController.deleteBooking);



module.exports = router; // Export the booking routes
