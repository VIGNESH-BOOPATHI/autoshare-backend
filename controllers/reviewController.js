const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

const reviewController = {
  // Create a new review
  createReview: async (req, res) => {
    const { bookingId, vehicleId, rating, comment } = req.body;
    const userId = req.user.userId;

    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to review this booking' });
      }

      const newReview = new Review({
        userId,
        bookingId,
        vehicleId,
        rating,
        comment,
      });

      await newReview.save();
      res.status(201).json({ message: 'Review created successfully', review: newReview });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  },

  // Get all reviews for a specific vehicle
  getReviewsForVehicle: async (req, res) => {
    const vehicleId = req.params.vehicleId.trim(); // Trim any extra whitespace or newline characters

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      // If the ObjectId is invalid, return an error
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    try {
      const reviews = await Review.find({ vehicleId }).populate('userId', 'name');
      res.status(200).json(reviews); // Return the list of reviews
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },

  // Update a review
  updateReview: async (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (review.userId.toString() !== userId) {
        return res.status(403).json({ error: 'You are not authorized to update this review' });
      }

      if (rating) {
        review.rating = rating;
      }

      if (comment) {
        review.comment = comment;
      }

      await review.save();
      res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  },

  // Delete a review
  deleteReview: async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        // Validate the ID format
        return res.status(400).json({ error: 'Invalid review ID' });
      }

    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (review.userId.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to delete this review' });
      }

      await Review.findByIdAndDelete(reviewId); // Delete the review using Mongoose method
      
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  },
};

module.exports = reviewController;
