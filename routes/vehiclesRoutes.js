const express = require('express');
const vehiclesController = require('../controllers/vehiclesController'); // Import the vehicles controller
const authenticateToken = require('../middleware/auth'); // JWT-based authentication
const checkRole = require('../middleware/role'); // Role-based access control
const checkOwnership = require('../middleware/ownership'); // Ownership check middleware
const multer = require('multer');
const multerS3 = require('multer-s3'); // Correct import for Multer with S3
const { S3Client } = require('@aws-sdk/client-s3'); // AWS SDK v3

const router = express.Router(); // Create a new router instance

// Set up AWS S3 client with AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer setup for S3 file uploads without ACLs
const upload = multer({
  storage: multerS3({
    s3: s3Client, // Use the new S3 client
    bucket: process.env.AWS_S3_BUCKET, // Ensure this is defined in .env
    // Remove acl to avoid AccessControlListNotSupported error
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}`); // Generate unique file names
    },
  }),
});

// Define the routes for vehicle operations
router.post('/', authenticateToken, checkRole('host'), upload.single('vehicleImage'), vehiclesController.addVehicle); // Add a new vehicle
router.put('/:id', authenticateToken, checkRole('host'), checkOwnership, upload.single('vehicleImage'), vehiclesController.updateVehicle); // Update a vehicle
router.delete('/:id', authenticateToken, checkRole('host'), checkOwnership, vehiclesController.deleteVehicle); // Delete a vehicle


// Route to list all vehicles
router.get('/', vehiclesController.listAllVehicles); // Require authentication to list vehicles

// Route to get a vehicle by its ID
router.get('/:id', vehiclesController.getVehicleById); // Get a single vehicle by ID

module.exports = router; // Export the router
