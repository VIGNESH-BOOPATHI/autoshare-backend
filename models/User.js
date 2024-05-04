const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema with required fields and role-based access
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  location: { type: String, default: 'Unknown' },
  phone: { type: Number, unique: true, required: true },
  role: {
    type: String,
    enum: ['user', 'host'], // Role-based access control
    default: 'user', // Default role
  },
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
