const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/materials
 * @desc Get all materials for a class
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { class_id } = req.query;

    // Build query
    let query = supabase
      .from('materials')
      .select(`
        id,
        title,
        description,
        file_url,
        file_type,
        file_size,
        created_at,
        updated_at,
        class_id,
        classes:class_id(name)
      `)
      .eq('teacher_id', userId);

    // Filter by class if provided
    if (class_id) {
      query = query.eq('class_id', class_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: {
        materials: data
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/materials
 * @desc Upload a new material
 * @access Private (Teacher only)
 */
router.post(
  '/',
  requireTeacher,
  [
    body('title').notEmpty().withMessage('Material title is required'),
    body('description').optional(),
    body('class_id').isUUID().withMessage('Valid class ID is required'),
    body('file_url').notEmpty().withMessage('File URL is required'),
    body('file_type').notEmpty().withMessage('File type is required'),
    body('file_size').isInt({ min: 1 }).withMessage('File size must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { title, description, class_id, file_url, file_type, file_size } = req.body;
      const teacherId = req.user.id;

      // Check if class exists and user is the teacher
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', class_id)
        .single();

      if (classError) {
        throw new ApiError(404, 'Class not found');
      }

      if (classData.teacher_id !== teacherId) {
        throw new ApiError(403, 'You do not have permission to upload materials to this class');
      }

      // Create new material
      const { data, error } = await supabase
        .from('materials')
        .insert({
          title,
          description,
          class_id,
          teacher_id: teacherId,
          file_url,
          file_type,
          file_size
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        data: {
          material: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/materials/:id
 * @desc Get a material by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid material ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get material details
      const { data: materialData, error: materialError } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          description,
          file_url,
          file_type,
          file_size,
          created_at,
          updated_at,
          class_id,
          teacher_id,
          classes:class_id(id, name)
        `)
        .eq('id', id)
        .single();

      if (materialError) {
        throw new ApiError(404, 'Material not found');
      }

      // Check if user is the teacher of this material
      if (materialData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to view this material');
      }

      res.status(200).json({
        status: 'success',
        data: {
          material: materialData
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/materials/:id
 * @desc Delete a material
 * @access Private (Teacher only)
 */
router.delete(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid material ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if material exists and user is the teacher
      const { data: existingMaterial, error: checkError } = await supabase
        .from('materials')
        .select('teacher_id, file_url')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Material not found');
      }

      if (existingMaterial.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to delete this material');
      }

      // Delete the file from storage
      const fileUrl = existingMaterial.file_url;
      if (fileUrl && fileUrl.includes('storage.googleapis.com')) {
        const path = fileUrl.split('/').pop();
        const { error: storageError } = await supabase.storage
          .from('materials')
          .remove([path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with deletion even if file removal fails
        }
      }

      // Delete material
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Material deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/materials/process
 * @desc Process a material for AI question generation
 * @access Private (Teacher only)
 */
router.post(
  '/process',
  requireTeacher,
  [
    body('material_id').isUUID().withMessage('Valid material ID is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { material_id } = req.body;
      const userId = req.user.id;

      // Check if material exists and user is the teacher
      const { data: materialData, error: materialError } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          file_url,
          file_type,
          teacher_id
        `)
        .eq('id', material_id)
        .single();

      if (materialError) {
        throw new ApiError(404, 'Material not found');
      }

      if (materialData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to process this material');
      }

      // In a real implementation, this would send the material to an AI service
      // For now, we'll just return a success message

      res.status(200).json({
        status: 'success',
        message: 'Material processing started',
        data: {
          material_id: materialData.id,
          title: materialData.title,
          job_id: 'mock-job-id', // In a real implementation, this would be a job ID to check status
          estimated_completion_time: '2 minutes'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
