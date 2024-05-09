// controllers/contactController.js
const Contact = require('../models/Contact'); // Import the Contact model

const contactController = {
  createContact: async (req, res) => {
    const { name, email, message } = req.body; // Extract contact form data

    if (!name || !email || !message) {
      // Validate required fields
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Create a new contact entry
      const newContact = new Contact({ name, email, message });

      await newContact.save(); // Save it to MongoDB

      res.status(201).json({ message: 'Contact data saved successfully' }); // Success response
    } catch (error) {
      console.error('Error saving contact data:', error);
      res.status(500).json({ error: 'Failed to save contact data' }); // Handle server errors
    }
  },
};

module.exports = contactController; // Export the contact controller
