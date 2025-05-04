const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/classes
 * @desc Get all classes for the current user
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get classes where the user is the teacher
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        teacher_id
      `)
      .eq('teacher_id', userId);

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: {
        classes: data
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/classes
 * @desc Create a new class
 * @access Private (Teacher only)
 */
router.post(
  '/',
  requireTeacher,
  [
    body('name').notEmpty().withMessage('Class name is required'),
    body('description').optional(),
    validate
  ],
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const teacherId = req.user.id;

      // Create new class
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name,
          description,
          teacher_id: teacherId
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        data: {
          class: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/classes/:id
 * @desc Get a class by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          teacher_id,
          teachers:teacher_id(id, email, user_metadata)
        `)
        .eq('id', id)
        .single();

      if (classError) {
        throw new ApiError(404, 'Class not found');
      }

      // Check if user is the teacher of this class
      if (classData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to view this class');
      }

      // Get students in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('class_students')
        .select(`
          student_id,
          students:student_id(id, email, user_metadata)
        `)
        .eq('class_id', id);

      if (studentsError) {
        throw new ApiError(500, studentsError.message);
      }

      // Get exams for this class
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          description,
          created_at,
          scheduled_date,
          duration
        `)
        .eq('class_id', id);

      if (examsError) {
        throw new ApiError(500, examsError.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          class: {
            ...classData,
            students: studentsData.map(item => item.students),
            exams: examsData
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/classes/:id
 * @desc Update a class
 * @access Private (Teacher only)
 */
router.patch(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    body('name').optional(),
    body('description').optional(),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const userId = req.user.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to update this class');
      }

      // Update class
      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const { data, error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          class: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/classes/:id
 * @desc Delete a class
 * @access Private (Teacher only)
 */
router.delete(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to delete this class');
      }

      // Delete class
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Class deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/classes/:id/students
 * @desc Add students to a class
 * @access Private (Teacher only)
 */
router.post(
  '/:id/students',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    body('student_ids').isArray().withMessage('Student IDs must be an array'),
    body('student_ids.*').isUUID().withMessage('Invalid student ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { student_ids } = req.body;
      const userId = req.user.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to add students to this class');
      }

      // Add students to class
      const studentEntries = student_ids.map(student_id => ({
        class_id: id,
        student_id
      }));

      const { error } = await supabase
        .from('class_students')
        .upsert(studentEntries, { onConflict: ['class_id', 'student_id'] });

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Students added to class successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/classes/:id/students/:studentId
 * @desc Remove a student from a class
 * @access Private (Teacher only)
 */
router.delete(
  '/:id/students/:studentId',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid class ID'),
    param('studentId').isUUID().withMessage('Invalid student ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id, studentId } = req.params;
      const userId = req.user.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to remove students from this class');
      }

      // Remove student from class
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', id)
        .eq('student_id', studentId);

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Student removed from class successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
