const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const authenticateToken = require('../middleware/auth'); // Authentication middleware

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


// Create a test payment endpoint
router.post('/create-payment', async (req, res) => {
    const paymentOptions = {
      amount: 50000, // Amount in paise (e.g., ₹500)
      currency: 'INR',
      receipt: 'receipt_123', // Unique identifier for the payment
    };
  
    try {
      const response = await razorpay.orders.create(paymentOptions); // Create Razorpay order
      res.status(200).json(response); // Return the order details
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });
  


// Route to create a new payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to smallest currency unit (e.g., paise for INR)
      currency: currency || 'INR', // Default to INR if not provided
      receipt, // Optional receipt reference
      notes, // Optional notes (object)
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Route to handle Razorpay webhook events (like payment success, refund, etc.)
router.post('/webhook', async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSignature || !webhookSecret) {
    return res.status(400).json({ error: 'Missing webhook signature or secret' });
  }

  try {
    // Verify the webhook signature to ensure authenticity
    Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      webhookSecret
    );

    // Handle the event (e.g., payment success)
    console.log('Razorpay webhook received:', req.body);

    // Acknowledge the webhook event
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error validating Razorpay webhook:', error);
    res.status(500).json({ error: 'Webhook validation failed' });
  }
});

module.exports = router;
