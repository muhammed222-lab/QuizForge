const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const supabase = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/user/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    // User data is already available from the authenticateToken middleware
    const userData = req.user;

    console.log('User profile request:', userData.id);

    res.status(200).json({
      status: 'success',
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.user_metadata?.full_name || userData.email,
        role: userData.user_metadata?.role || 'teacher',
        avatar: userData.user_metadata?.avatar || null
      }
    });
  } catch (error) {
    console.error('Error in user profile endpoint:', error);
    next(error);
  }
});

/**
 * @route GET /api/user/test
 * @desc Test endpoint that doesn't require authentication
 * @access Public
 */
router.get('/test', async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User API is working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route PATCH /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.patch(
  '/profile',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('institution').optional(),
    body('department').optional(),
    validate
  ],
  async (req, res, next) => {
    try {
      const { name, institution, department } = req.body;

      // Get current user metadata
      const userData = req.user;
      const currentMetadata = userData.user_metadata || {};

      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          ...(name && { full_name: name }),
          ...(institution && { institution }),
          ...(department && { department })
        }
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name,
          role: data.user.user_metadata.role,
          institution: data.user.user_metadata.institution,
          department: data.user.user_metadata.department,
          avatar: data.user.user_metadata.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/user/password
 * @desc Update user password
 * @access Private
 */
router.post(
  '/password',
  authenticateToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { current_password, new_password } = req.body;

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: req.user.email,
        password: current_password
      });

      if (signInError) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: new_password
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

/**
 * @route PATCH /api/user/notifications
 * @desc Update user notification settings
 * @access Private
 */
router.patch(
  '/notifications',
  authenticateToken,
  async (req, res, next) => {
    try {
      const { email_notifications, exam_submissions, new_students, system_updates } = req.body;

      // Get current user metadata
      const userData = req.user;
      const currentMetadata = userData.user_metadata || {};
      const currentNotifications = currentMetadata.notifications || {};

      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          notifications: {
            ...currentNotifications,
            ...(email_notifications !== undefined && { email_notifications }),
            ...(exam_submissions !== undefined && { exam_submissions }),
            ...(new_students !== undefined && { new_students }),
            ...(system_updates !== undefined && { system_updates })
          }
        }
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          notifications: data.user.user_metadata.notifications
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/user/appearance
 * @desc Update user appearance settings
 * @access Private
 */
router.patch(
  '/appearance',
  authenticateToken,
  async (req, res, next) => {
    try {
      const { theme, font_size, high_contrast } = req.body;

      // Get current user metadata
      const userData = req.user;
      const currentMetadata = userData.user_metadata || {};
      const currentAppearance = currentMetadata.appearance || {};

      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          appearance: {
            ...currentAppearance,
            ...(theme !== undefined && { theme }),
            ...(font_size !== undefined && { font_size }),
            ...(high_contrast !== undefined && { high_contrast })
          }
        }
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          appearance: data.user.user_metadata.appearance
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/user/avatar
 * @desc Update user avatar
 * @access Private
 */
router.post(
  '/avatar',
  authenticateToken,
  [
    body('avatar_url').notEmpty().withMessage('Avatar URL is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { avatar_url } = req.body;

      // Get current user metadata
      const userData = req.user;
      const currentMetadata = userData.user_metadata || {};

      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          avatar: avatar_url
        }
      });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          avatar: data.user.user_metadata.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
