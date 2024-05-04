const express = require('express');
const vehiclesController = require('../controllers/vehiclesController'); // Import the vehicles controller
const authenticateToken = require('../middleware/auth'); // JWT-based authentication
const checkRole = require('../middleware/role'); // Role-based access control
const checkOwnership = require('../middleware/ownership'); // Ownership check middleware
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const router = express.Router(); // Create a new router instance

// Set up AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer setup for S3 file uploads
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read', // Allow public read access
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}`); // Generate unique file names
    },
  }),
});

// Add a new vehicle (restricted to hosts)
router.post('/', authenticateToken, checkRole('host'), upload.single('vehicleImage'), vehiclesController.addVehicle);

// Update a vehicle (restricted to hosts and ownership check)
router.put('/:id', authenticateToken, checkRole('host'), checkOwnership, upload.single('vehicleImage'), vehiclesController.updateVehicle);

// Delete a vehicle (restricted to hosts and ownership check)
router.delete('/:id', authenticateToken, checkRole('host'), checkOwnership, vehiclesController.deleteVehicle);

// Book a vehicle (restricted to users)
router.post('/book/:id', authenticateToken, checkRole('user'), vehiclesController.bookVehicle);

// Cancel a booking (restricted to users)
router.delete('/cancel/:id', authenticateToken, checkRole('user'), vehiclesController.cancelBooking);

module.exports = router; // Export the router
