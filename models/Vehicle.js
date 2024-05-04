const mongoose = require('mongoose');

// Vehicle schema with the 'addedBy' reference
const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  imageUrl: { type: String, required: true }, // AWS S3 image storage
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the host who added the vehicle
});

module.exports = mongoose.model('Vehicle', vehicleSchema); // Export the Vehicle model
