// routes/contactRoutes.js
const express = require('express');
const contactController = require('../controllers/contactController'); // Import the contact controller
const router = express.Router(); // Create a new Express router

// Route for adding a new contact entry
router.post('/contact', contactController.createContact); // Endpoint for adding contact data

module.exports = router; // Export the router
