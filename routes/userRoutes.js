const express = require('express');
const userController = require('../controllers/userController'); // Import the user controller
const authenticateToken = require('../middleware/auth'); // JWT-based authentication
const checkRole = require('../middleware/role'); // Role-based access control

const router = express.Router(); // Create a new router instance

// Route to get all users (admin-only)
router.get('/all', authenticateToken, checkRole('admin'), userController.getAllUsers);

// Route to get a user by ID (authenticated users)
router.get('/:id', authenticateToken, userController.getUserById);

// Route to update user details (authenticated users, only their own details)
router.put('/:id', authenticateToken, userController.updateUser);

// Route to delete a user (admin-only)
router.delete('/:id', authenticateToken, checkRole('admin'), userController.deleteUser);

module.exports = router; // Export the router
