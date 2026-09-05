const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Helper — creates a JWT token containing the admin's ID (expires in 7 days)
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// POST /api/admin/login — verify credentials for the single registered admin
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the plain password with the hashed one in the DB
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Credentials are correct — send back admin info + token
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
