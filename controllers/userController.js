const User = require('../models/User'); // Import the User model
const mongoose = require('mongoose'); // Mongoose for MongoDB operations
const jwt = require('jsonwebtoken'); // JWT for token generation
require("dotenv").config();

const userController = {
  // Get all users (admin-only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password'); // Exclude the password field
      res.status(200).json(users); // Return all user data
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: 'Failed to fetch all users' });
    }
  },

  // Get a specific user by ID
  getUserById: async (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL parameters

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' }); // Validate the ObjectId
    }

    try {
      const user = await User.findById(userId, '-password'); // Fetch user by ID excluding the password
      if (!user) {
        return res.status(404).json({ error: 'User not found' }); // Handle user not found
      }

      res.status(200).json(user); // Return the user data
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      res.status(500).json({ error: 'Failed to fetch user by ID' });
    }
  },

  // Update user details (authenticated users can update their own info)
  updateUser: async (req, res) => {
    const userId = req.params.id; // User ID from the route parameters
    const user = req.user; // Authenticated user from the JWT token
   

    if (user.userId !== userId) {
      return res.status(403).json({ error: `Unauthorized: Cannot update other users ${user.userId} and ${userId}` }); // Restrict to updating own info
    }

    const updates = {}; // Store the provided updates
    const { name, location, phone } = req.body;

    if (name) updates.name = name;
    if (location) updates.location = location;
    if (phone) updates.phone = phone;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates }, // Apply the updates
        { new: true, select: '-password' } // Return the updated user without the password field
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

        // Generate JWT for successful verification
        const token = jwt.sign(
          { userId: user._id, role: user.role, name: user.name},
          process.env.JWT_SECRET,
          { expiresIn: '24h' } // Token valid for 24 hours
        );

      res.status(200).json({ message: 'User updated successfully', user: updatedUser, token });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' }); // Handle server errors
    }
  },

  // Admin-only: Delete user by ID
  deleteUser: async (req, res) => {
    const userId = req.params.id; // User ID from route parameters

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' }); // Validate ObjectId
    }

    try {
      const deletedUser = await User.findByIdAndDelete(userId); // Delete the user by ID

      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' }); // Handle non-existent user
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' }); // Handle server errors
    }
  },
};

module.exports = userController; // Export the user controller
