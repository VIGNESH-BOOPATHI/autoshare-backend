const express = require('express');
const userController = require('../controllers/userController'); // User controller to be created
const authenticateToken = require('../middleware/auth'); // JWT-based authentication
const checkRole = require('../middleware/role'); // Role-based access control

const router = express.Router(); // Create a new router instance

// Route to get all users (admin-only)
router.get('/all', authenticateToken, checkRole('admin'), userController.getAllUsers);

// Route to get a user by ID (authentication only)
router.get('/:id', authenticateToken, userController.getUserById);

module.exports = router; // Export the router
