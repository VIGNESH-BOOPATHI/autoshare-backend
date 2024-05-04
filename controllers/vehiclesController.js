const Vehicle = require('../models/Vehicle'); // Vehicle model
const AWS = require('aws-sdk'); // AWS S3 for file storage

// Set up AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const vehiclesController = {
  // Add a new vehicle (restricted to hosts)
  addVehicle: async (req, res) => {
    const { name, category, pricePerDay, available } = req.body;

    try {
      const newVehicle = new Vehicle({
        name,
        category,
        pricePerDay,
        available,
        imageUrl: req.file.location, // Store the S3 image URL
        addedBy: req.user._id, // Reference to the host who added the vehicle
      });

      await newVehicle.save(); // Save the new vehicle

      res.status(201).json(newVehicle); // Return the created vehicle
    } catch (error) {
      res.status(500).json({ error: 'Failed to add vehicle' }); // Handle unexpected errors
    }
  },

  // Update a vehicle (restricted to hosts and ownership check)
  updateVehicle: async (req, res) => {
    const { name, category, pricePerDay, available } = req.body;

    try {
      const vehicle = req.vehicle; // The vehicle from the ownership check middleware

      if (req.file) {
        const key = vehicle.imageUrl.split('/').pop(); // Extract the S3 key
        s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        }, (err, data) => {
          if (err) {
            console.error('Error deleting old image from S3:', err);
          } else {
            console.log('Old image deleted from S3:', data);
          }
        });

        vehicle.imageUrl = req.file.location; // Update with the new image URL
      }

      vehicle.name = name || vehicle.name;
      vehicle.category = category || vehicle.category;
      vehicle.pricePerDay = pricePerDay || vehicle.pricePerDay;
      vehicle.available = available !== undefined ? available : vehicle.available;

      await vehicle.save(); // Save the updated vehicle

      res.status(200).json(vehicle); // Return the updated vehicle
    } catch (error) {
      res.status(500).json({ error: 'Failed to update vehicle' }); // Handle errors
    }
  },

  // Delete a vehicle (restricted to hosts and ownership check)
  deleteVehicle: async (req, res) => {
    const vehicle = req.vehicle; // The vehicle from the ownership check

    if (vehicle.imageUrl) {
      const key = vehicle.imageUrl.split('/').pop(); // Extract the S3 key
      s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }, (err, data) => {
        if (err) {
          console.error('Error deleting object from S3:', err); // Handle S3 deletion errors
        } else {
          console.log('Deleted object from S3:', data); // Log success
        }
      });
    }

    await Vehicle.findByIdAndDelete(vehicle._id); // Delete the vehicle from MongoDB

    res.status(200).json({ message: 'Vehicle deleted successfully' }); // Success message
  },

  // Book a vehicle (restricted to users)
  bookVehicle: async (req, res) => {
    const { id } = req.params; // Vehicle ID from the route parameters

    try {
      const vehicle = await Vehicle.findById(id); // Find the vehicle by ID

      if (!vehicle || !vehicle.available) {
        return res.status(404).json({ error: 'Vehicle not available' }); // Handle unavailable vehicle
      }

      // Implement booking logic here (e.g., create a booking record)
      // For simplicity, this example returns a success message
      res.status(200).json({ message: 'Vehicle booked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to book vehicle' }); // Handle errors
    }
  },

  // Cancel a booking (restricted to users)
  cancelBooking: async (req, res) => {
    const { id } = req.params; // Booking ID from the route parameters

    try {
      // Implement booking cancellation logic here
      // This example simply returns a success message
      res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel booking' }); // Handle errors
    }
  },
};

module.exports = vehiclesController; // Export the controller
