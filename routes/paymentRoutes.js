const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
require("dotenv").config();
const cors = require("cors");
const crypto = require("crypto");
const authenticateToken = require('../middleware/auth'); // Authentication middleware

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
  


// Route to create a new payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Convert to smallest currency unit (e.g., paise for INR)
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
router.post('/validate', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

module.exports = router;
