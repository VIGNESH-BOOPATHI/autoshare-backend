// Middleware for role-based access control
const checkRole = (requiredRole) => {
    return (req, res, next) => {
      const { role } = req.user; // Get the user's role from the authenticated token
  
      if (role !== requiredRole) {
        return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
      }
  
      next(); // Continue to the next middleware or route handler
    };
  };

  
  
  module.exports = checkRole; // Export the role-checking middleware

  