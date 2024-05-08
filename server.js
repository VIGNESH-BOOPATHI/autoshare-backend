const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet'); // For security-related HTTP headers
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');
const bookingsRoutes = require('./routes/bookingsRoutes'); // Import the new bookings routes
const reviewRoutes = require('./routes/reviewsRoutes'); // Import review routes


dotenv.config(); // Load environment variables
const app = express(); // Express.js instance

// Middleware to set the time zone for each request (optional)
const setTimeZoneMiddleware = (req, res, next) => {
  process.env.TZ = 'Asia/Kolkata'; // Set the time zone to IST
  next(); // Proceed to the next middleware or route handler
};

// Apply the middleware globally (before any routes)
app.use(setTimeZoneMiddleware); // Ensures time zone is set for every request

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting to the vehicles route
app.use('/vehicles', limiter); // This applies the rate limit to all vehicle endpoints

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

  // Run a job every hour to check for bookings that should be completed
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();

  try {
    const bookings = await Booking.find({ endTime: { $lt: now }, completed: false });

    for (const booking of bookings) {
      // Mark the booking as completed
      booking.completed = true;
      await booking.save();

      // Set the vehicle as available again
      const vehicle = await Vehicle.findById(booking.vehicleId);
      if (vehicle) {
        vehicle.available = true;
        await vehicle.save();
      }
    }

    console.log(`Completed ${bookings.length} bookings`);
  } catch (error) {
    console.error('Error completing bookings:', error);
  }
});

  console.log('OTP cleanup job scheduled.');
  console.log('Booking completion job scheduled.');
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
app.use('/vehicles', vehiclesRoutes); // Vehicle CRUD 
app.use('/bookings', bookingsRoutes); // Apply the bookings routes
app.use('/reviews', reviewRoutes); // New route for reviews

// Default route for the server
app.get('/', (req, res) => {
  res.send('Welcome to AutoShare API!'); // Default response
});

// Start server
const PORT = process.env.PORT || 3000; // Use port 3000 or a custom port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log server start
});
