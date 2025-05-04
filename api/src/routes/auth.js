const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const supabase = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'teacher' // Default role
          }
        }
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.full_name,
            role: data.user.user_metadata.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/auth/login
 * @desc Login teacher with email and password
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Use regular email login for teachers
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password
      });

      const userData = signInResult.data;
      const error = signInResult.error;

      if (error) {
        throw new ApiError(401, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: userData.user.id,
            email: userData.user.email,
            name: userData.user.user_metadata?.full_name || 'Teacher',
            role: userData.user.user_metadata?.role || 'teacher'
          },
          session: {
            access_token: userData.session.access_token,
            refresh_token: userData.session.refresh_token,
            expires_at: userData.session.expires_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.user_metadata.full_name,
          role: req.user.user_metadata.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        throw new ApiError(401, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CORS_ORIGIN}/auth/reset-password`
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Private
 */
router.post(
  '/reset-password',
  authenticateToken,
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { password } = req.body;

      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
