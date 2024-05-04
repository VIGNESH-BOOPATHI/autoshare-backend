const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables
const app = express(); // Express.js instance
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log HTTP requests

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB')) // Connection successful
  .catch((err) => console.error('MongoDB connection error:', err)); // Handle errors

// Import route files
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const vehiclesRoutes = require('./routes/vehiclesRoutes'); // Vehicle CRUD operations

// Define routes
app.use('/auth', authRoutes); // Authentication and OTP-based login routes
app.use('/vehicles', vehiclesRoutes); // Vehicle CRUD operations

// Default route for the server
app.get('/', (req, res) => {
  res.send('Welcome to AutoShare API!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
