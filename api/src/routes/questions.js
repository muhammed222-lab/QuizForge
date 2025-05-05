const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route GET /api/questions
 * @desc Get questions for an exam
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { exam_id } = req.query;
    const userId = req.user.id;

    if (!exam_id) {
      throw new ApiError(400, 'Exam ID is required');
    }

    // Check if exam exists and user is the teacher
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('teacher_id')
      .eq('id', exam_id)
      .single();

    if (examError) {
      throw new ApiError(404, 'Exam not found');
    }

    if (examData.teacher_id !== userId) {
      throw new ApiError(403, 'You do not have permission to view questions for this exam');
    }

    // Get questions for this exam
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', exam_id)
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: {
        questions: data
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/questions
 * @desc Create a new question
 * @access Private (Teacher only)
 */
router.post(
  '/',
  requireTeacher,
  [
    body('exam_id').isUUID().withMessage('Valid exam ID is required'),
    body('question_text').notEmpty().withMessage('Question text is required'),
    body('question_type').isIn(['multiple_choice', 'true_false', 'short_answer', 'essay']).withMessage('Invalid question type'),
    body('options').optional().isArray().withMessage('Options must be an array'),
    body('correct_answer').optional(),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { exam_id, question_text, question_type, options, correct_answer, points } = req.body;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('teacher_id')
        .eq('id', exam_id)
        .single();

      if (examError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (examData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to add questions to this exam');
      }

      // Validate question data based on type
      if (question_type === 'multiple_choice' && (!options || options.length < 2)) {
        throw new ApiError(400, 'Multiple choice questions must have at least 2 options');
      }

      if ((question_type === 'multiple_choice' || question_type === 'true_false') && correct_answer === undefined) {
        throw new ApiError(400, `${question_type} questions must have a correct answer`);
      }

      // Create new question
      const { data, error } = await supabase
        .from('questions')
        .insert({
          exam_id,
          question_text,
          question_type,
          options,
          correct_answer,
          points: points || 1
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        data: {
          question: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/questions/:id
 * @desc Get a question by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid question ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get question with exam info
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select(`
          *,
          exams:exam_id(id, title, teacher_id)
        `)
        .eq('id', id)
        .single();

      if (questionError) {
        throw new ApiError(404, 'Question not found');
      }

      // Check if user is the teacher of this exam
      if (questionData.exams.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to view this question');
      }

      res.status(200).json({
        status: 'success',
        data: {
          question: questionData
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/questions/:id
 * @desc Update a question
 * @access Private (Teacher only)
 */
router.patch(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid question ID'),
    body('question_text').optional(),
    body('question_type').optional().isIn(['multiple_choice', 'true_false', 'short_answer', 'essay']).withMessage('Invalid question type'),
    body('options').optional().isArray().withMessage('Options must be an array'),
    body('correct_answer').optional(),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { question_text, question_type, options, correct_answer, points } = req.body;
      const userId = req.user.id;

      // Get question with exam info
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select(`
          *,
          exams:exam_id(teacher_id)
        `)
        .eq('id', id)
        .single();

      if (questionError) {
        throw new ApiError(404, 'Question not found');
      }

      // Check if user is the teacher of this exam
      if (questionData.exams.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to update this question');
      }

      // Update question
      const updateData = {};
      if (question_text) updateData.question_text = question_text;
      if (question_type) updateData.question_type = question_type;
      if (options) updateData.options = options;
      if (correct_answer !== undefined) updateData.correct_answer = correct_answer;
      if (points) updateData.points = points;

      // Validate question data based on type
      const finalType = question_type || questionData.question_type;
      const finalOptions = options || questionData.options;
      const finalCorrectAnswer = correct_answer !== undefined ? correct_answer : questionData.correct_answer;

      if (finalType === 'multiple_choice' && (!finalOptions || finalOptions.length < 2)) {
        throw new ApiError(400, 'Multiple choice questions must have at least 2 options');
      }

      if ((finalType === 'multiple_choice' || finalType === 'true_false') && finalCorrectAnswer === undefined) {
        throw new ApiError(400, `${finalType} questions must have a correct answer`);
      }

      const { data, error } = await supabase
        .from('questions')
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
          question: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/questions/:id
 * @desc Delete a question
 * @access Private (Teacher only)
 */
router.delete(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid question ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get question with exam info
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select(`
          exam_id,
          exams:exam_id(teacher_id)
        `)
        .eq('id', id)
        .single();

      if (questionError) {
        throw new ApiError(404, 'Question not found');
      }

      // Check if user is the teacher of this exam
      if (questionData.exams.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to delete this question');
      }

      // Delete question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(200).json({
        status: 'success',
        message: 'Question deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/questions/bulk
 * @desc Create multiple questions at once
 * @access Private (Teacher only)
 */
router.post(
  '/bulk',
  requireTeacher,
  [
    body('exam_id').isUUID().withMessage('Valid exam ID is required'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.question_text').notEmpty().withMessage('Question text is required'),
    body('questions.*.question_type').isIn(['multiple_choice', 'true_false', 'short_answer', 'essay']).withMessage('Invalid question type'),
    body('questions.*.options').optional().isArray().withMessage('Options must be an array'),
    body('questions.*.correct_answer').optional(),
    body('questions.*.points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { exam_id, questions } = req.body;
      const userId = req.user.id;

      // Check if exam exists and user is the teacher
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('teacher_id')
        .eq('id', exam_id)
        .single();

      if (examError) {
        throw new ApiError(404, 'Exam not found');
      }

      if (examData.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to add questions to this exam');
      }

      // Validate all questions
      for (const [index, question] of questions.entries()) {
        if (question.question_type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
          throw new ApiError(400, `Question ${index + 1}: Multiple choice questions must have at least 2 options`);
        }

        if ((question.question_type === 'multiple_choice' || question.question_type === 'true_false') && question.correct_answer === undefined) {
          throw new ApiError(400, `Question ${index + 1}: ${question.question_type} questions must have a correct answer`);
        }
      }

      // Prepare questions for insertion
      const questionsToInsert = questions.map(q => ({
        exam_id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1
      }));

      // Insert questions
      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (error) {
        throw new ApiError(400, error.message);
      }

      res.status(201).json({
        status: 'success',
        message: `${data.length} questions created successfully`,
        data: {
          questions: data
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
