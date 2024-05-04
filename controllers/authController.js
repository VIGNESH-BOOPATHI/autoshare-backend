const User = require('../models/User');
const OTP = require('../models/OTP'); // OTP storage model
const bcrypt = require('bcryptjs'); // Password hashing
const jwt = require('jsonwebtoken'); // JWT for token generation
const { generateOTP, sendOTP } = require('../utils/otp'); // OTP generation and email utilities

const authController = {
  // User registration
  register: async (req, res) => {
    const { email, password, name, location, phone } = req.body;

    try {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
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
      res.status(500).json({ error: 'Failed to register user' }); // Handle errors
    }
  },

  // Login with OTP generation
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' }); // Handle incorrect login
      }

      const otp = generateOTP(); // Generate the OTP
      const otpExpiry = Date.now() + (5 * 60 * 1000); // OTP valid for 5 minutes

      await OTP.create({ userId: user._id, otp, expiry }); // Store the OTP
      await sendOTP(user.email, otp); // Send the OTP via email

      res.status(200).json({ message: 'OTP sent. Please enter it to complete the login.' });
    } catch (error) {
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

      if (!storedOTP || storedOTP.expiry < Date.now() || storedOTP.otp !== otp) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }

      await OTP.deleteOne({ userId: user._id }); // Delete the OTP after verification

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h', // Token expiration
      });

      res.status(200).json({ token }); // Return the JWT on successful OTP verification
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },
};

module.exports = authController;
