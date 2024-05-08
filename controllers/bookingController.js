const Booking = require('../models/Booking'); // Booking model
const Vehicle = require('../models/Vehicle'); // Vehicle model
const mongoose = require('mongoose');

const bookingController = {
  // Create a new booking
  createBooking: async (req, res) => {
    const { vehicleId, duration } = req.body; // Vehicle ID and duration from request
    const userId = req.user.userId; // Authenticated user ID from JWT

    try {
      // Check if the vehicle exists and is available
      const vehicle = await Vehicle.findById(vehicleId);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (!vehicle.available) {
        return res.status(403).json({ error: 'Vehicle is not available for booking' });
      }

      // Create a new booking
      const newBooking = new Booking({
        vehicleId,
        userId,
        duration,
        bookedAt: new Date(),
        endTime: new Date(new Date().setDate(new Date().getDate() + duration)), // End time based on duration
      });

      await newBooking.save(); // Save the booking

      // Update vehicle availability
      vehicle.available = false;
      await vehicle.save();

      res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },

  // Read a specific booking by ID
  getBookingById: async (req, res) => {
    const bookingId = req.params.id; // Booking ID from route parameters
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      // Handle invalid ObjectId
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
  
    try {
      const booking = await Booking.findById(bookingId).populate('vehicleId');
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.status(200).json(booking); // Return booking details
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      res.status(500).json({ error: 'Failed to fetch booking by ID' });
    }
  },

  // List all bookings for a user
  listBookings: async (req, res) => {
    const userId = req.user.userId; // Authenticated user ID from JWT

    try {
      const bookings = await Booking.find({ userId }).populate('vehicleId'); // Get all bookings for the user

      res.status(200).json(bookings); // Return the list of bookings
    } catch (error) {
      console.error('Error listing bookings:', error);
      res.status(500).json({ error: 'Failed to list bookings' });
    }
  },

  // Update a booking's duration
  updateBooking: async (req, res) => {
    const bookingId = req.params.id; // Booking ID from route parameters
    const { duration } = req.body; // New duration from request body

    try {
      const booking = await Booking.findById(bookingId); // Fetch the booking by ID

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Update the duration and end time
      booking.duration = duration;
      booking.endTime = new Date(booking.bookedAt.getTime() + duration * 24 * 60 * 60 * 1000); // Calculate new end time
      await booking.save(); // Save the updated booking

      res.status(200).json({ message: 'Booking updated successfully', booking });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  },

  // Delete a booking
  deleteBooking: async (req, res) => {
    const bookingId = req.params.id; // Booking ID from route parameters
    const userId = req.user.userId; // Authenticated user ID from JWT

    try {
      const booking = await Booking.findById(bookingId); // Fetch the booking by ID

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot delete another user\'s booking' });
      }

      const vehicle = await Vehicle.findById(booking.vehicleId); // Fetch associated vehicle
      if (vehicle) {
        vehicle.available = true; // Set the vehicle back to available
        await vehicle.save(); // Save the updated vehicle
      }

      await Booking.findByIdAndDelete(bookingId); // Delete the booking

      res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  },
   
  // List all bookings for admin-level access
  listAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({}).populate('vehicleId'); // Get all bookings
      res.status(200).json(bookings); // Return the list of bookings
    } catch (error) {
      console.error('Error listing all bookings:', error);
      res.status(500).json({ error: 'Failed to list all bookings' });
    }
  },
};

module.exports = bookingController; // Export the booking controller
