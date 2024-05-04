const express = require('express');
const authController = require('../controllers/authController'); // Import the auth controller
const router = express.Router();

// User registration endpoint
router.post('/register', authController.register);

// Login with OTP generation
router.post('/login', authController.login);

// OTP verification to complete the login process
router.post('/verify-otp', authController.verifyOtp);

module.exports = router; // Export the router
