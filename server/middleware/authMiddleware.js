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

module.exports = { protect };
