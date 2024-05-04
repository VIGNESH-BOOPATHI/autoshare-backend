const Vehicle = require('../models/Vehicle'); // Import the Vehicle model

// Middleware to check vehicle ownership
const checkOwnership = async (req, res, next) => {
  const vehicleId = req.params.id;

  try {
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (!vehicle.addedBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access forbidden: not the owner of this vehicle' }); // Handle unauthorized access
    }

    req.vehicle = vehicle; // Attach the vehicle to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(500).json({ error: 'Error checking ownership' }); // Handle errors
  }
};

module.exports = checkOwnership; // Export the ownership-checking middleware
