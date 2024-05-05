const express = require('express');
const authController = require('../controllers/authController'); // Import the auth controller
const router = express.Router(); // Initialize the router

// User registration endpoint
router.post('/register', authController.register); // Creates a new user account

// User login endpoint with OTP generation
router.post('/login', authController.login); // Authenticates user and sends OTP

// OTP verification endpoint
router.post('/verify-otp', authController.verifyOtp); // Verifies the OTP to complete login

module.exports = router; // Export the router
