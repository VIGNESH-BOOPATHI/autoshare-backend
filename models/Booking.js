const mongoose = require('mongoose'); // Import mongoose for MongoDB operations

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true, // Vehicle ID is required
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // User ID is required
  },
  bookedAt: {
    type: Date,
    default: Date.now, // Default to the current date and time
  },
  duration: {
    type: Number, // Duration in days
    default: 1, // Default duration is 1 day
  },
  completed: {
    type: Boolean,
    default: false, // Booking isn't completed by default
  },
  endTime: {
    type: Date,
    default: function () {
      const endDate = new Date(this.bookedAt);
      endDate.setDate(endDate.getDate() + this.duration); // Calculate end time
      return endDate;
    },
    required: true, // End time is required for bookings
  },
});

module.exports = mongoose.model('Booking', bookingSchema); // Export the Booking model
