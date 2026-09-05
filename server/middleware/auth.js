const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// This middleware runs BEFORE the route handler.
// It checks if the request has a valid JWT token.
// If yes → attaches the admin's info to req.admin and calls next().
// If no  → sends back a 401 Unauthorized response.
const auth = async (req, res, next) => {
  try {
    // Token comes in the header as: "Bearer <token>"
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // Extract just the token part (after "Bearer ")
    const token = header.split(' ')[1];

    // Verify the token — this throws an error if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the admin in the DB and attach to req (minus the password)
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    next(); // Token is valid — proceed to the route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth;
