const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = bearerHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the full user so req.user._id and req.user.role work everywhere
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = { protect, adminOnly };
