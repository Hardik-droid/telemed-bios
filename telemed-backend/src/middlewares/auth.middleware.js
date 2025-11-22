// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded; // { id, role }

      if (
        Array.isArray(requiredRoles) &&
        requiredRoles.length > 0 &&
        !requiredRoles.includes(decoded.role)
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;