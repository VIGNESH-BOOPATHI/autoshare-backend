const jwt = require('jsonwebtoken');

// Middleware for JWT-based authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' }); // Reject if no token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' }); // Handle invalid token
    }

    req.user = user; // Attach user information to the request object
    next(); // Continue to the next middleware or route handler
  });
};

module.exports = authenticateToken; // Export the middleware
