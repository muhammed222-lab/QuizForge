const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const router = express.Router();

/**
 * @route GET /api/classes
 * @desc Get all classes for the current user
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get the teacher_id for the authenticated user
    let { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    // If teacher not found, create one
    if (teacherError && teacherError.code === 'PGRST116') {
      console.log('Creating teacher record for user:', userId);

      const { data: newTeacher, error: insertError } = await supabaseAdmin
        .from('teachers')
        .insert({
          auth_user_id: userId,
          name: req.user.user_metadata?.full_name || req.user.email,
          email: req.user.email
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating teacher record:', insertError);
        throw new ApiError(500, 'Failed to create teacher profile');
      }

      teacherData = newTeacher;
      console.log('Teacher record created successfully:', teacherData.id);
    } else if (teacherError) {
      console.error('Error fetching teacher record:', teacherError);
      throw new ApiError(404, 'Teacher profile not found');
    }

    const teacherId = teacherData.id;

    // Get classes where the user is the teacher
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        subject,
        grade_level,
        created_at,
        updated_at,
        teacher_id,
        (
          SELECT COUNT(*)
          FROM class_students
          WHERE class_students.class_id = classes.id
        ) as student_count
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

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
    body('subject').optional(),
    body('grade_level').optional(),
    validate
  ],
  async (req, res, next) => {
    try {
      const { name, description, subject, grade_level } = req.body;
      const userId = req.user.id;

      // Get the teacher_id for the authenticated user
      let { data: teacherData, error: teacherError } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      // If teacher not found, create one
      if (teacherError && teacherError.code === 'PGRST116') {
        console.log('Creating teacher record for user:', userId);

        const { data: newTeacher, error: insertError } = await supabaseAdmin
          .from('teachers')
          .insert({
            auth_user_id: userId,
            name: req.user.user_metadata?.full_name || req.user.email,
            email: req.user.email
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating teacher record:', insertError);
          throw new ApiError(500, 'Failed to create teacher profile');
        }

        teacherData = newTeacher;
        console.log('Teacher record created successfully:', teacherData.id);
      } else if (teacherError) {
        console.error('Error fetching teacher record:', teacherError);
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Create new class
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name,
          description,
          subject,
          grade_level,
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

      // Get the teacher_id for the authenticated user
      let { data: teacherData, error: teacherError } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      // If teacher not found, create one
      if (teacherError && teacherError.code === 'PGRST116') {
        console.log('Creating teacher record for user:', userId);

        const { data: newTeacher, error: insertError } = await supabaseAdmin
          .from('teachers')
          .insert({
            auth_user_id: userId,
            name: req.user.user_metadata?.full_name || req.user.email,
            email: req.user.email
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating teacher record:', insertError);
          throw new ApiError(500, 'Failed to create teacher profile');
        }

        teacherData = newTeacher;
        console.log('Teacher record created successfully:', teacherData.id);
      } else if (teacherError) {
        console.error('Error fetching teacher record:', teacherError);
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Get class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          subject,
          grade_level,
          created_at,
          updated_at,
          teacher_id,
          teachers:teacher_id(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (classError) {
        throw new ApiError(404, 'Class not found');
      }

      // Check if user is the teacher of this class
      if (classData.teacher_id !== teacherId) {
        throw new ApiError(403, 'You do not have permission to view this class');
      }

      // Get students in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('class_students')
        .select(`
          student_id,
          students:student_id(id, name, matric_number, email)
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
    body('subject').optional(),
    body('grade_level').optional(),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, subject, grade_level } = req.body;
      const userId = req.user.id;

      // Get the teacher_id for the authenticated user
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (teacherError) {
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== teacherId) {
        throw new ApiError(403, 'You do not have permission to update this class');
      }

      // Update class
      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (subject) updateData.subject = subject;
      if (grade_level) updateData.grade_level = grade_level;

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

      // Get the teacher_id for the authenticated user
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (teacherError) {
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== teacherId) {
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

      // Get the teacher_id for the authenticated user
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (teacherError) {
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== teacherId) {
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

      // Get the teacher_id for the authenticated user
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (teacherError) {
        throw new ApiError(404, 'Teacher profile not found');
      }

      const teacherId = teacherData.id;

      // Check if class exists and user is the teacher
      const { data: existingClass, error: checkError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Class not found');
      }

      if (existingClass.teacher_id !== teacherId) {
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
