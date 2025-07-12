// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Secret key for JWT. In a real app, this should be in environment variables.
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Attach user payload (e.g., { id: 'userId' }) to the request
    next();
  });
};

module.exports = authenticateToken;

