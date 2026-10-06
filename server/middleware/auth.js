const jwt = require('jsonwebtoken');
const { UserRepository } = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'vquiz_jwt_secret_dev_key_2026';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: User not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserRepository.findById(decoded.id);
      if (user) req.user = user;
    } catch (_) {
      // Ignored for optional auth
    }
  }
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: `Access denied. Requires '${role}' role.` });
    }
    next();
  };
};

module.exports = { verifyToken, optionalAuth, requireRole, JWT_SECRET };
