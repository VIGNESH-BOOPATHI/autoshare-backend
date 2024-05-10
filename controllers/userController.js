const User = require('../models/User'); // Import the User model
const mongoose = require('mongoose'); // Mongoose for MongoDB operations

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
};

module.exports = userController; // Export the user controller
