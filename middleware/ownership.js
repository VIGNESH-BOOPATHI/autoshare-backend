const Vehicle = require('../models/Vehicle'); // Import the Vehicle model
const jwt = require('jsonwebtoken'); // Import JWT to decode token
require("dotenv").config();

// Middleware to check vehicle ownership
const checkOwnership = async (req, res, next) => {
  const vehicleId = req.params.id; // The ID of the vehicle from the URL parameter

  try {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from authorization header
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token to get user info
    const userId = decoded.userId; // Get user ID from decoded token

    const vehicle = await Vehicle.findById(vehicleId); // Find the vehicle by its ID

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' }); // Handle case where vehicle is not found
    }

    if (!vehicle.addedBy.equals(userId)) {
      return res.status(403).json({ error: 'Access forbidden: not the owner of this vehicle' }); // Handle unauthorized access
    }

    req.vehicle = vehicle; // Attach the vehicle to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    console.error('Error checking ownership:', error); // Log any unexpected errors
    res.status(500).json({ error: 'Error checking ownership' }); // General error response
  }
};

module.exports = checkOwnership; // Export the ownership-checking middleware
