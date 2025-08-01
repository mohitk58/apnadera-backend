const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ 
        error: 'Not authorized to access this route',
        message: 'No token provided'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Not authorized to access this route',
        message: 'User not found'
      });
    }
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated',
        message: 'Please contact support'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Not authorized to access this route',
      message: 'Invalid token'
    });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
module.exports = { protect, authorize }; 