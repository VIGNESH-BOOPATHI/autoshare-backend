const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3'); // AWS SDK v3
const Vehicle = require('../models/Vehicle'); // Vehicle 
const Booking = require('../models/Booking'); // Import the Booking model
const jwt = require('jsonwebtoken'); // JWT for authentication
const { checkRole } = require('../middleware/role'); // Role-based access control

// Set up AWS S3 client with AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to delete an object from S3
const deleteS3Object = async (bucket, key) => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const response = await s3Client.send(command); // AWS SDK v3 approach
    console.log('Deleted object from S3:', response);
  } catch (error) {
    console.error('Error deleting object from S3:', error);
  }
};

const vehiclesController = {
  // Add a new vehicle (restricted to hosts)
  addVehicle: async (req, res) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user information' });
    }

    const { name, category, pricePerDay, available } = req.body;

    try {
      const newVehicle = new Vehicle({
        name,
        category,
        pricePerDay: parseFloat(pricePerDay),
        available: available === 'true',
        imageUrl: req.file.location,
        addedBy: req.user.userId, // Use user ID from the token
      });

      await newVehicle.save(); // Save the new vehicle

      res.status(201).json(newVehicle); // Return the created vehicle
    } catch (error) {
      console.error('Error adding vehicle:', error);
      res.status(500).json({ error: 'Failed to add vehicle' }); // Handle errors
    }
  },

  // Update a vehicle (restricted to hosts and ownership check)
updateVehicle: async (req, res) => {
  const vehicleId = req.params.id; // Extract the vehicle ID from the URL
  const { name, category, pricePerDay, available } = req.body; // Get fields from the request body

  try {
     const vehicle = await Vehicle.findById(vehicleId); // Find the vehicle by its ID

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' }); // Handle case where vehicle is not found
    }
    // Check if an image was provided
    if (req.file) {
      // If a new image is provided, delete the old one from S3
      const oldKey = vehicle.imageUrl.split('/').pop(); // Extract the S3 key
      await deleteS3Object(process.env.AWS_S3_BUCKET, oldKey); // Delete the old image from S3

      vehicle.imageUrl = req.file.location; // Update with the new image URL
    }

    // Update only the provided fields
    if (name) vehicle.name = name;
    if (category) vehicle.category = category;
    if (pricePerDay) vehicle.pricePerDay = parseFloat(pricePerDay); // Convert to number
    if (available !== undefined) {
      vehicle.available = available === 'true'; // Convert string to boolean
    }

    await vehicle.save(); // Save the updated vehicle to the database

    res.status(200).json(vehicle); // Return the updated vehicle
  } catch (error) {
    console.error('Error updating vehicle:', error); // Log the error
    res.status(500).json({ error: 'Failed to update vehicle' }); // Send an error response
  }
}
,

  // Delete a vehicle (restricted to hosts and ownership check)
  deleteVehicle: async (req, res) => {
    const vehicle = req.vehicle; // The vehicle from the ownership check


    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    try {
      if (vehicle.imageUrl) {
        const key = vehicle.imageUrl.split('/').pop(); // Extract the S3 key
        await deleteS3Object(process.env.AWS_S3_BUCKET, key); // Delete from S3
      }
  
      await Vehicle.findByIdAndDelete(vehicle._id); // Delete the vehicle from MongoDB
  
      res.status(200).json({ message: 'Vehicle deleted successfully' }); // Success message
    } catch (error) {
      console.error('Error deleting vehicle:', error); // Log unexpected errors
      res.status(500).json({ error: 'Failed to delete vehicle' }); // General error response
    }
  },

    // List all vehicles with optional filtering, sorting, and pagination
    listAllVehicles: async (req, res) => {
      try {
        // Extract query parameters for filtering, sorting, and pagination
        const { category, minPrice, maxPrice, sortBy, limit, skip } = req.query;
    
        // Create a query object to filter by category and price range
        const query = {};
    
        if (category) {
          query.category = category; // Filter by category
        }
    
        if (minPrice) {
          const parsedMinPrice = parseFloat(minPrice);
          if (isNaN(parsedMinPrice)) {
            return res.status(400).json({ error: 'Invalid minPrice' });
          }
          query.pricePerDay = { $gte: parsedMinPrice }; // Greater than or equal to minPrice
        }
    
        if (maxPrice) {
          const parsedMaxPrice = parseFloat(maxPrice);
          if (isNaN(parsedMaxPrice)) {
            return res.status(400).json({ error: 'Invalid maxPrice' });
          }
          query.pricePerDay = {
            ...(query.pricePerDay || {}),
            $lte: parsedMaxPrice, // Less than or equal to maxPrice
          };
        }
    
        // Define valid fields for sorting
        const validSortFields = ['name', 'category', 'pricePerDay', 'available'];
        const sortOptions = {};
        if (sortBy) {
          const [field, order] = sortBy.split(':'); // "field:asc" or "field:desc"
          if (!validSortFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid sort field' });
          }
          sortOptions[field] = order === 'desc' ? -1 : 1;
        } else {
          sortOptions['name'] = 1; // Default sorting by name in ascending order
        }
    
        // Default limit and skip for pagination
        const pageSize = parseInt(limit) || 10; // Default to 10 items per page
        const pageSkip = parseInt(skip) || 0; // Default to starting at 0
    
        // Find vehicles with the constructed query, sorting, and pagination
        const vehicles = await Vehicle.find(query)
          .sort(sortOptions)
          .limit(pageSize)
          .skip(pageSkip);
    
        res.status(200).json(vehicles); // Respond with the list of vehicles
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' }); // Handle errors
      }
    },
     // Get a single vehicle by its ID
     getVehicleById: async (req, res) => {
      const vehicleId = req.params.id; // Get the vehicle ID from the URL parameters
  
      try {
        const vehicle = await Vehicle.findById(vehicleId); // Find the vehicle by ID
        
        if (!vehicle) {
          // If no vehicle is found with the given ID, return a 404 error
          return res.status(404).json({ error: 'Vehicle not found' });
        }
  
        // Return the vehicle data
        res.status(200).json(vehicle);
      } catch (error) {
        console.error('Error fetching vehicle by ID:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle by ID' }); // Handle any server-side errors
      }
    },
  
};

module.exports = vehiclesController; // Export the controller
