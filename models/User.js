const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Raw password before saving
  name: { type: String },
  location: { type: String, default: 'Unknown' },
  phone: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ['user', 'host'], // Role-based access control
    default: 'user',
  },
});



module.exports = mongoose.model('User', userSchema); // Export the model
