const mongoose = require('mongoose');

// OTP schema for email-based OTP verification
const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: Number, required: true },
  expiry: { type: Date, required: true }, // Expiration time for the OTP
});

module.exports = mongoose.model('OTP', otpSchema); // Export the OTP model
