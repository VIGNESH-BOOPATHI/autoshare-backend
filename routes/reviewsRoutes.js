const express = require('express');
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/role');

const router = express.Router();

// Route to create a new review
router.post('/', authenticateToken, reviewController.createReview);

// Route to get all reviews for a specific vehicle
router.get('/:vehicleId', reviewController.getReviewsForVehicle);

// Route to update a review
router.put('/:id', authenticateToken, reviewController.updateReview);

// Route to delete a review
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
