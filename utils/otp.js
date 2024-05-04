const nodemailer = require('nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Create a Nodemailer transporter for sending OTPs via email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Example: Using Gmail
  auth: {
    user: process.env.EMAIL_USER, // Email user from environment variables
    pass: process.env.EMAIL_PASS, // App-specific password or similar
  },
});

// Send OTP via email
const sendOTP = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to: email, // Receiver's email
    subject: 'Your OTP for AutoShare',
    text: `Your OTP for AutoShare login is: ${otp}. It is valid for 5 minutes.`,
  };

  return transporter.sendMail(mailOptions); // Send the email
};

module.exports = {
  generateOTP,
  sendOTP,
}; // Export the utility functions
