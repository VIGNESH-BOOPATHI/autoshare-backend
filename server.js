const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet'); // For security-related HTTP headers
const moment = require('moment-timezone'); // For time zone handling
const cron = require('node-cron');
const OTP = require('../models/OTP'); // Import the OTP model

dotenv.config(); // Load environment variables
const app = express(); // Express.js instance

// Middleware to set the time zone for each request (optional)
const setTimeZoneMiddleware = (req, res, next) => {
  process.env.TZ = 'Asia/Kolkata'; // Set the time zone to IST
  next(); // Proceed to the next middleware or route handler
};

// Apply the middleware globally (before any routes)
app.use(setTimeZoneMiddleware); // Ensures time zone is set for every request



// Other middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log HTTP requests
app.use(helmet()); // Enhance security with Helmet

//// Setup MongoDB connection
mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');

  // Start the OTP cleanup job
  cron.schedule('*/10 * * * *', async () => {
    const now = new Date();
    try {
      const result = await OTP.deleteMany({ expiry: { $lt: now } });
      console.log(`Deleted ${result.deletedCount} expired OTPs`);
    } catch (error) {
      console.error('Error deleting expired OTPs:', error);
    }
  });

  console.log('OTP cleanup job scheduled.');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit with an error code if the connection fails
});

// Route definitions
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const vehiclesRoutes = require('./routes/vehiclesRoutes'); // Vehicle CRUD operations

// Apply routes
app.use('/auth', authRoutes); // Authentication and OTP-based login routes
app.use('/vehicles', vehiclesRoutes); // Vehicle CRUD operations

// Default route for the server
app.get('/', (req, res) => {
  res.send('Welcome to AutoShare API!'); // Default response
});

// Start server
const PORT = process.env.PORT || 3000; // Use port 3000 or a custom port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log server start
});
