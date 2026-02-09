const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`Debug Auth [${req.originalUrl}]: Token received`, token.substring(0, 10) + "...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Debug Auth [${req.originalUrl}]: Token decoded`, decoded);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
          console.log(`Debug Auth [${req.originalUrl}]: User not found for ID`, decoded.id);
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (req.user.isActive === false) {
          return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

      next();
    } catch (error) {
      console.error(`Debug Auth [${req.originalUrl}]: Error verifying token`, error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log(`Debug Auth [${req.originalUrl}]: No Authorization header or not Bearer`);
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (req.user && req.user.isActive === false) {
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

      next();
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, admin, authorize };
