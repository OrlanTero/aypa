const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'aypa_ecommerce_secret';

// Verify token middleware
exports.auth = async (req, res, next) => {
  // Log request headers for debugging
  console.log('Auth Headers:', {
    auth: req.header('x-auth-token'),
    authLength: req.header('x-auth-token')?.length || 0,
    contentType: req.header('Content-Type'),
    authHeader: req.header('Authorization')
  });

  // Check for token in different places
  const token = req.header('x-auth-token') || 
                req.header('Authorization')?.replace('Bearer ', '') || 
                req.query.token;

  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(403).json({ msg: 'No token provided, authentication required' });
  }

  try {
    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded.user;
      
      console.log('Token decoded successfully:', { userId: decoded.user.id, role: decoded.user.role });
      
      // Verify the user still exists in the database
      const user = await User.findById(decoded.user.id).select('-password');
      if (!user) {
        console.log('Auth failed: User not found in database');
        return res.status(404).json({ msg: 'User no longer exists' });
      }

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token has expired, please login again' });
      } else {
        return res.status(401).json({ msg: 'Invalid token, please login again' });
      }
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ msg: 'Server error during authentication' });
  }
};

// Admin role check middleware
exports.admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('Admin check failed: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role !== 'admin') {
      console.log('Admin check failed: User not admin', { userId: req.user.id, role: user.role });
      return res.status(403).json({ msg: 'Access denied. Admin permission required' });
    }

    console.log('Admin authorization successful', { userId: req.user.id });
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}; 