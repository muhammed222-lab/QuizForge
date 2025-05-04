const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    // Attach user to request object
    req.user = data.user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.user_metadata.role !== 'admin') {
      throw new ApiError(403, 'Access denied: Admin privileges required');
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has teacher role
 */
const requireTeacher = (req, res, next) => {
  try {
    if (!req.user || 
        (req.user.user_metadata.role !== 'teacher' && 
         req.user.user_metadata.role !== 'admin')) {
      throw new ApiError(403, 'Access denied: Teacher privileges required');
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireTeacher
};
