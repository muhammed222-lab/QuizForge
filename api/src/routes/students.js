const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/students
 * @desc Get all students for the current teacher
 * @access Private (Teacher only)
 */
router.get('/', requireTeacher, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { class_id } = req.query;

    // Get classes taught by this teacher
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', userId);

    if (classesError) {
      throw new ApiError(500, classesError.message);
    }

    const classIds = classesData.map(c => c.id);

    if (classIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          students: []
        }
      });
    }

    // Build query to get students in these classes
    let query = supabase
      .from('class_students')
      .select(`
        student_id,
        class_id,
        classes:class_id(name),
        students:student_id(id, email, user_metadata)
      `)
      .in('class_id', classIds);

    // Filter by class if provided
    if (class_id) {
      query = query.eq('class_id', class_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(500, error.message);
    }

    // Process data to get unique students with their classes
    const studentsMap = new Map();

    data.forEach(item => {
      const studentId = item.student_id;
      const studentInfo = item.students;
      const classInfo = {
        id: item.class_id,
        name: item.classes.name
      };

      if (studentsMap.has(studentId)) {
        studentsMap.get(studentId).classes.push(classInfo);
      } else {
        studentsMap.set(studentId, {
          id: studentId,
          email: studentInfo.email,
          name: studentInfo.user_metadata?.full_name || 'Unknown',
          classes: [classInfo]
        });
      }
    });

    const students = Array.from(studentsMap.values());

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/students/:id
 * @desc Get a student by ID
 * @access Private (Teacher only)
 */
router.get(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid student ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if student exists
      const { data: studentData, error: studentError } = await supabase.auth.admin.getUserById(id);

      if (studentError || !studentData) {
        throw new ApiError(404, 'Student not found');
      }

      // Get classes taught by this teacher
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', userId);

      if (classesError) {
        throw new ApiError(500, classesError.message);
      }

      const classIds = classesData.map(c => c.id);

      // Check if student is in any of the teacher's classes
      const { data: studentClasses, error: studentClassesError } = await supabase
        .from('class_students')
        .select(`
          class_id,
          classes:class_id(id, name, description)
        `)
        .eq('student_id', id)
        .in('class_id', classIds);

      if (studentClassesError) {
        throw new ApiError(500, studentClassesError.message);
      }

      if (studentClasses.length === 0) {
        throw new ApiError(403, 'You do not have permission to view this student');
      }

      // Get exam results for this student
      const { data: examResults, error: examResultsError } = await supabase
        .from('exam_results')
        .select(`
          id,
          score,
          max_score,
          completed_at,
          exams:exam_id(id, title, class_id)
        `)
        .eq('student_id', id)
        .in('exams.class_id', classIds);

      if (examResultsError) {
        throw new ApiError(500, examResultsError.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          student: {
            id: studentData.user.id,
            email: studentData.user.email,
            name: studentData.user.user_metadata?.full_name || 'Unknown',
            classes: studentClasses.map(item => item.classes),
            exam_results: examResults
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/students/invite
 * @desc Invite students to join the platform
 * @access Private (Teacher only)
 */
router.post(
  '/invite',
  requireTeacher,
  [
    body('emails').isArray().withMessage('Emails must be an array'),
    body('emails.*').isEmail().withMessage('Invalid email address'),
    body('class_id').optional().isUUID().withMessage('Invalid class ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { emails, class_id } = req.body;
      const teacherId = req.user.id;

      // If class_id is provided, check if teacher owns the class
      if (class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', class_id)
          .single();

        if (classError) {
          throw new ApiError(404, 'Class not found');
        }

        if (classData.teacher_id !== teacherId) {
          throw new ApiError(403, 'You do not have permission to invite students to this class');
        }
      }

      // In a real implementation, this would send invitation emails
      // For now, we'll just return a success message

      res.status(200).json({
        status: 'success',
        message: `Invitations sent to ${emails.length} students`,
        data: {
          invited_emails: emails
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/students/create
 * @desc Create student accounts (admin or teacher)
 * @access Private (Teacher only)
 */
router.post(
  '/create',
  requireTeacher,
  [
    body('students').isArray().withMessage('Students must be an array'),
    body('students.*.email').optional().isEmail().withMessage('Invalid email address'),
    body('students.*.name').notEmpty().withMessage('Name is required'),
    body('students.*.matric_number').notEmpty().withMessage('Matric number is required'),
    body('class_id').optional().isUUID().withMessage('Invalid class ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { students, class_id } = req.body;
      const teacherId = req.user.id;

      // If class_id is provided, check if teacher owns the class
      if (class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('teacher_id')
          .eq('id', class_id)
          .single();

        if (classError) {
          throw new ApiError(404, 'Class not found');
        }

        if (classData.teacher_id !== teacherId) {
          throw new ApiError(403, 'You do not have permission to add students to this class');
        }
      }

      // Check for duplicate matric numbers
      const matricNumbers = students.map(s => s.matric_number);
      const { data: existingMatricNumbers, error: matricCheckError } = await supabase
        .from('profiles')
        .select('matric_number')
        .in('matric_number', matricNumbers);

      if (matricCheckError) {
        throw new ApiError(500, matricCheckError.message);
      }

      const duplicateMatricNumbers = existingMatricNumbers.map(p => p.matric_number);
      if (duplicateMatricNumbers.length > 0) {
        throw new ApiError(400, `The following matric numbers already exist: ${duplicateMatricNumbers.join(', ')}`);
      }

      const createdStudents = [];
      const errors = [];

      // Create student accounts
      for (const student of students) {
        try {
          // Generate an email if not provided
          const email = student.email || `${student.matric_number}@quizforge.edu`;

          // Generate a random password (or use matric number as initial password)
          const password = student.matric_number; // Using matric number as initial password

          // Create user in Supabase
          const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: student.name,
              role: 'student'
            }
          });

          if (error) {
            errors.push({ matric_number: student.matric_number, error: error.message });
            continue;
          }

          // Create profile with matric number
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              matric_number: student.matric_number,
              full_name: student.name
            });

          if (profileError) {
            errors.push({ matric_number: student.matric_number, error: profileError.message });

            // Clean up the user if profile creation fails
            await supabase.auth.admin.deleteUser(data.user.id);
            continue;
          }

          createdStudents.push({
            id: data.user.id,
            email,
            name: student.name,
            matric_number: student.matric_number
          });

          // If class_id is provided, add student to class
          if (class_id) {
            await supabase
              .from('class_students')
              .insert({
                class_id,
                student_id: data.user.id
              });
          }

          // In a real implementation, send email or SMS with login details
        } catch (error) {
          errors.push({ matric_number: student.matric_number, error: error.message });
        }
      }

      res.status(201).json({
        status: 'success',
        message: `Created ${createdStudents.length} student accounts`,
        data: {
          created_students: createdStudents,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
