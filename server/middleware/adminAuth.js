// server/middleware/adminAuth.js
const User = require('../models/user'); // User model
const authenticateToken = require('./auth'); // Existing JWT authentication middleware

const authorizeAdmin = async (req, res, next) => {
  // First, ensure the user is authenticated
  authenticateToken(req, res, async () => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required for admin access' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      // If user is admin, proceed
      next();
    } catch (err) {
      console.error('Error during admin authorization:', err.message);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  });
};

module.exports = authorizeAdmin;

