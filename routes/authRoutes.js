const express = require('express');
const authController = require('../controllers/authController'); // Import the auth controller
const router = express.Router(); // Initialize the router
const authenticateToken = require('../middleware/auth'); // JWT authentication middleware

// User registration endpoint
router.post('/register', authController.register); // Creates a new user account

// User login endpoint with OTP generation
router.post('/login', authController.login); // Authenticates user and sends OTP

// OTP verification endpoint
router.post('/verify-otp', authController.verifyOtp); // Verifies the OTP to complete login

// Toggle user role endpoint
router.post('/toggle-role', authenticateToken, authController.toggleRole); // Toggle user role by confirming email and password


module.exports = router; // Export the router
