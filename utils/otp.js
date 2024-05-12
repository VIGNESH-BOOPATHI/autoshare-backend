const nodemailer = require('nodemailer');
require("dotenv").config();


// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

// Create a Nodemailer transporter for sending OTPs via email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as an example
  auth: {
    user: process.env.EMAIL_USER, // Environment variable for email user
    pass: process.env.EMAIL_PASS, // Environment variable for email password
  },
});

// Send OTP via email with error handling
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for AutoShare', // Email subject
    text: `Your OTP for AutoShare login is: ${otp}. It is valid for 5 minutes.`, // Email body
  };

  try {
    await transporter.sendMail(mailOptions); // Try sending the email
    console.log(`OTP sent to ${email}`); // Log success
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error); // Log error
    throw error; // Rethrow the error for handling in the controller
  }
};

module.exports = {
  generateOTP,
  sendOTP,
}; // Export the utility functions
