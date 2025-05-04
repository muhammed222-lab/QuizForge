const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
      console.error('Token verification error:', error);
      throw new ApiError(401, 'Invalid or expired token');
    }

    // Attach user to request object
    req.user = data.user;

    // Check if teacher record exists and create it if it doesn't
    try {
      // Check if teacher record already exists
      const { data: existingTeacher, error: checkError } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Create teacher record if it doesn't exist
        const { data: teacher, error: insertError } = await supabaseAdmin
          .from('teachers')
          .insert({
            auth_user_id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email,
            email: data.user.email
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating teacher record:', insertError);
        } else {
          console.log('Teacher record created successfully:', teacher.id);
        }
      }
    } catch (err) {
      console.error('Error checking/creating teacher record:', err);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
