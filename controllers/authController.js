const User = require('../models/User'); // User model
const OTP = require('../models/OTP'); // OTP model
const bcrypt = require('bcryptjs'); // Password hashing
const jwt = require('jsonwebtoken'); // JWT for token generation
const { generateOTP, sendOTP } = require('../utils/otp'); // OTP generation and email utilities
const moment = require('moment-timezone'); // Time zone handling library

const authController = {
  // User registration
  register: async (req, res) => {
    const { email, password, name, location, phone } = req.body;

    try {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        location,
        phone,
      });

      await newUser.save(); // Save the new user

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  // Login with OTP generation
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }); // Find user by email

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' }); // Incorrect login
      }


        // Delete expired OTPs before generating a new one
    await OTP.deleteMany({ userId: user._id, expiry: { $lt: new Date() } });

      // Generate OTP and set expiry time in IST (UTC+05:30)
      const otp = generateOTP(); // Generate a 6-digit OTP
      const otpExpiry = moment().add(5, 'minutes').toDate(); // Storing in UTC
      
      // Store OTP with correct expiry time
      await OTP.create({ userId: user._id, otp, expiry: otpExpiry });

      try {
        await sendOTP(user.email, otp); // Send OTP via email
        res.status(200).json({ message: 'OTP sent. Please enter it to complete the login.' });
      } catch (emailError) {
        console.error('Failed to send OTP:', emailError);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to process login request' });
    }
  },

  // OTP verification to complete the login process
  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const storedOTP = await OTP.findOne({ userId: user._id });

      // Convert stored UTC expiry time to IST
      const storedOtpExpiry = moment(storedOTP.expiry).tz('Asia/Kolkata').valueOf(); // Convert to IST
      
        // Get the current time in IST for comparison
  const currentISTTime = moment().tz('Asia/Kolkata').valueOf();

  if (!storedOTP || storedOtpExpiry < currentISTTime) {
    return res.status(401).json({ error: 'OTP has expired' }); // Handle expired OTP
  }

      if (storedOTP.otp !== otp) {
        return res.status(401).json({ error: 'Incorrect OTP' }); // Incorrect OTP
      }

      // Delete the OTP after successful verification
      await OTP.deleteOne({ userId: user._id });

      // Generate JWT for successful verification
      const token = jwt.sign(
        { userId: user._id, role: user.role, name: user.name},
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token valid for 24 hours
      );

      res.status(200).json({ token }); // Return JWT on successful OTP verification
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },

  toggleRole: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the password matches
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Incorrect password' }); // If password is incorrect
      }

      // Toggle the user role
      user.role = user.role === 'user' ? 'host' : 'user'; // Toggle between 'user' and 'host'

      await user.save(); // Save the updated user

      const token = jwt.sign(
        { userId: user._id, role: user.role, name: user.name},
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token valid for 24 hours
      );

      res.status(200).json({ message: `Role changed to ${user.role}`, token }); // Return success message

    } catch (error) {
      console.error('Error toggling role:', error);
      res.status(500).json({ error: 'Failed to toggle role' }); // Handle errors
    }
  }
};

module.exports = authController; // Export the controller
