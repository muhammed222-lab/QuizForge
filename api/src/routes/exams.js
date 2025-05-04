const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/exams
 * @desc Get all exams for the current user
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { class_id } = req.query;

    // Build query
    let query = supabase
      .from('exams')
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        scheduled_date,
        duration,
        class_id,
        classes:class_id(name),
        question_count:questions(count)
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
        exams: data
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/exams
 * @desc Create a new exam
 * @access Private (Teacher only)
 */
router.post(
  '/',
  requireTeacher,
  [
    body('title').notEmpty().withMessage('Exam title is required'),
    body('description').optional(),
    body('class_id').isUUID().withMessage('Valid class ID is required'),
    body('scheduled_date').optional().isISO8601().withMessage('Invalid date format'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { title, description, class_id, scheduled_date, duration } = req.body;
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
        throw new ApiError(403, 'You do not have permission to create an exam for this class');
      }

      // Create new exam
      const { data, error } = await supabase
        .from('exams')
        .insert({
          title,
          description,
          class_id,
          teacher_id: teacherId,
          scheduled_date,
          duration
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        data: {
          exam: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/exams/:id
 * @desc Get an exam by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          scheduled_date,
          duration,
          class_id,
          teacher_id,
          classes:class_id(id, name),
          teachers:teacher_id(id, email, user_metadata)
        `)
        .eq('id', id)
        .single();

      if (examError) {
        throw new ApiError(404, 'Exam not found');
      }

      // Check if user is the teacher of this exam
      if (examData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to view this exam');
      }

      // Get questions for this exam
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          points
        `)
        .eq('exam_id', id)
        .order('created_at', { ascending: true });

      if (questionsError) {
        throw new ApiError(500, questionsError.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          exam: {
            ...examData,
            questions: questionsData
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/exams/:id
 * @desc Update an exam
 * @access Private (Teacher only)
 */
router.patch(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    body('title').optional(),
    body('description').optional(),
    body('scheduled_date').optional().isISO8601().withMessage('Invalid date format'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, scheduled_date, duration } = req.body;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: existingExam, error: checkError } = await supabase
        .from('exams')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (existingExam.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to update this exam');
      }

      // Update exam
      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (scheduled_date) updateData.scheduled_date = scheduled_date;
      if (duration) updateData.duration = duration;

      const { data, error } = await supabase
        .from('exams')
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
          exam: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/exams/:id
 * @desc Delete an exam
 * @access Private (Teacher only)
 */
router.delete(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: existingExam, error: checkError } = await supabase
        .from('exams')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (existingExam.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to delete this exam');
      }

      // Delete exam
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Exam deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/exams/:id/generate
 * @desc Generate questions for an exam using AI
 * @access Private (Teacher only)
 */
router.post(
  '/:id/generate',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    body('document_id').optional().isUUID().withMessage('Invalid document ID'),
    body('num_questions').isInt({ min: 1, max: 50 }).withMessage('Number of questions must be between 1 and 50'),
    body('question_types').optional().isArray().withMessage('Question types must be an array'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { document_id, num_questions, question_types } = req.body;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: existingExam, error: checkError } = await supabase
        .from('exams')
        .select('teacher_id')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (existingExam.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to generate questions for this exam');
      }

      // TODO: Implement AI question generation
      // This would typically call an external AI service or use a local model
      // For now, we'll just return a success message

      res.status(200).json({
        status: 'success',
        message: 'Question generation started',
        data: {
          job_id: 'mock-job-id', // In a real implementation, this would be a job ID to check status
          estimated_completion_time: '30 seconds'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/exams/:id/publish
 * @desc Publish an exam to make it available to students
 * @access Private (Teacher only)
 */
router.post(
  '/:id/publish',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: existingExam, error: checkError } = await supabase
        .from('exams')
        .select('teacher_id, questions(count)')
        .eq('id', id)
        .single();

      if (checkError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (existingExam.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to publish this exam');
      }

      // Check if exam has questions
      if (existingExam.questions[0].count === 0) {
        throw new ApiError(400, 'Cannot publish an exam with no questions');
      }

      // Generate a unique access code for the exam
      const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Update exam status to published with the access code
      const { data, error } = await supabase
        .from('exams')
        .update({
          status: 'published',
          published_at: new Date(),
          access_code: accessCode
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      // Generate shareable URL
      const shareableUrl = `${process.env.CORS_ORIGIN}/exam/${id}?code=${accessCode}`;

      res.status(200).json({
        status: 'success',
        message: 'Exam published successfully',
        data: {
          exam: data,
          shareableUrl,
          accessCode
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/exams/:id/access
 * @desc Access an exam with an access code (for students, no auth required)
 * @access Public
 */
router.get(
  '/:id/access',
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    query('code').notEmpty().withMessage('Access code is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { code } = req.query;

      // Check if exam exists and the access code is valid
      const { data: exam, error } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          description,
          status,
          time_limit,
          shuffle_questions,
          shuffle_answers,
          strict_timing,
          class_id,
          classes:class_id(name)
        `)
        .eq('id', id)
        .eq('access_code', code)
        .eq('status', 'published')
        .single();

      if (error || !exam) {
        throw new ApiError(404, 'Exam not found or invalid access code');
      }

      // Get questions for this exam
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_type,
          options
        `)
        .eq('exam_id', id)
        .order('created_at', { ascending: true });

      if (questionsError) {
        throw new ApiError(500, questionsError.message);
      }

      // Remove correct answers from questions for students
      const studentQuestions = questions.map(q => {
        const { correct_answer, ...rest } = q;
        return rest;
      });

      // If shuffle_questions is true, randomize the order of questions
      if (exam.shuffle_questions) {
        studentQuestions.sort(() => Math.random() - 0.5);
      }

      // If shuffle_answers is true, randomize the order of options for multiple choice questions
      if (exam.shuffle_answers) {
        studentQuestions.forEach(q => {
          if (q.question_type === 'multiple_choice' && q.options) {
            q.options = [...q.options].sort(() => Math.random() - 0.5);
          }
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          exam: {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            time_limit: exam.time_limit,
            strict_timing: exam.strict_timing,
            class_name: exam.classes.name
          },
          questions: studentQuestions
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/exams/:id/submit
 * @desc Submit answers for an exam (for students, no auth required)
 * @access Public
 */
router.post(
  '/:id/submit',
  [
    param('id').isUUID().withMessage('Invalid exam ID'),
    body('code').notEmpty().withMessage('Access code is required'),
    body('student_name').notEmpty().withMessage('Student name is required'),
    body('student_id').notEmpty().withMessage('Student ID/Matric number is required'),
    body('answers').isArray().withMessage('Answers must be an array'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { code, student_name, student_id, answers } = req.body;

      // Check if exam exists and the access code is valid
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          class_id,
          status
        `)
        .eq('id', id)
        .eq('access_code', code)
        .eq('status', 'published')
        .single();

      if (examError || !exam) {
        throw new ApiError(404, 'Exam not found or invalid access code');
      }

      // Get questions with correct answers for grading
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_type,
          correct_answer,
          points
        `)
        .eq('exam_id', id);

      if (questionsError) {
        throw new ApiError(500, questionsError.message);
      }

      // Create a map of question IDs to correct answers and points
      const questionMap = {};
      questions.forEach(q => {
        questionMap[q.id] = {
          correct_answer: q.correct_answer,
          question_type: q.question_type,
          points: q.points || 1
        };
      });

      // Create or get student record
      let studentId;
      const { data: existingStudent, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('matric_number', student_id)
        .single();

      if (studentError) {
        // Create new student record
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            name: student_name,
            matric_number: student_id,
            class_id: exam.class_id
          })
          .select('id')
          .single();

        if (createError) {
          throw new ApiError(500, 'Failed to create student record');
        }

        studentId = newStudent.id;
      } else {
        studentId = existingStudent.id;
      }

      // Create exam attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .insert({
          exam_id: id,
          student_id: studentId,
          started_at: new Date(),
          completed_at: new Date()
        })
        .select('id')
        .single();

      if (attemptError) {
        throw new ApiError(500, 'Failed to create exam attempt');
      }

      // Process and grade answers
      let totalPoints = 0;
      let earnedPoints = 0;
      const gradedAnswers = [];

      for (const answer of answers) {
        const questionInfo = questionMap[answer.question_id];

        if (!questionInfo) continue; // Skip if question not found

        let isCorrect = false;

        // Grade based on question type
        if (questionInfo.question_type === 'multiple_choice' || questionInfo.question_type === 'true_false') {
          isCorrect = answer.answer === questionInfo.correct_answer;
        } else if (questionInfo.question_type === 'short_answer') {
          // For short answer, do a case-insensitive comparison
          isCorrect = answer.answer.toLowerCase().trim() === questionInfo.correct_answer.toLowerCase().trim();
        }
        // Essay questions need manual grading, so we leave isCorrect as false

        // Add points if correct
        if (isCorrect) {
          earnedPoints += questionInfo.points;
        }
        totalPoints += questionInfo.points;

        // Save the answer
        const { error: answerError } = await supabase
          .from('student_answers')
          .insert({
            attempt_id: attempt.id,
            question_id: answer.question_id,
            answer: answer.answer,
            is_correct: isCorrect,
            points_awarded: isCorrect ? questionInfo.points : 0
          });

        if (answerError) {
          console.error('Error saving answer:', answerError);
          // Continue with other answers even if one fails
        }

        gradedAnswers.push({
          question_id: answer.question_id,
          is_correct: isCorrect,
          points_awarded: isCorrect ? questionInfo.points : 0
        });
      }

      // Update the attempt with the score
      await supabase
        .from('exam_attempts')
        .update({
          score: earnedPoints,
          max_score: totalPoints
        })
        .eq('id', attempt.id);

      res.status(200).json({
        status: 'success',
        message: 'Exam submitted successfully',
        data: {
          score: earnedPoints,
          max_score: totalPoints,
          percentage: Math.round((earnedPoints / totalPoints) * 100),
          answers: gradedAnswers
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
