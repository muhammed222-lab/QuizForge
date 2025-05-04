const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');
const { requireTeacher } = require('../middleware/auth');
const supabase = require('../utils/db');

const router = express.Router();

/**
 * @route POST /api/submissions
 * @desc Submit an exam (for students)
 * @access Public
 */
router.post(
  '/',
  [
    body('exam_id').isUUID().withMessage('Valid exam ID is required'),
    body('access_code').notEmpty().withMessage('Access code is required'),
    body('student_name').notEmpty().withMessage('Student name is required'),
    body('matric_number').notEmpty().withMessage('Matric number is required'),
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.question_id').isUUID().withMessage('Valid question ID is required'),
    body('answers.*.answer').exists().withMessage('Answer is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { exam_id, access_code, student_name, matric_number, answers } = req.body;

      // Check if exam exists and is published
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          status,
          access_code,
          class_id
        `)
        .eq('id', exam_id)
        .eq('status', 'published')
        .single();

      if (examError || !examData) {
        throw new ApiError(404, 'Exam not found or not published');
      }

      // Verify access code
      if (examData.access_code !== access_code) {
        throw new ApiError(401, 'Invalid access code');
      }

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('exam_submissions')
        .insert({
          exam_id,
          student_name,
          matric_number,
          started_at: new Date(),
          completed_at: new Date()
        })
        .select()
        .single();

      if (submissionError) {
        throw new ApiError(500, submissionError.message);
      }

      // Get questions with correct answers
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_type, correct_answer, points')
        .eq('exam_id', exam_id);

      if (questionsError) {
        throw new ApiError(500, questionsError.message);
      }

      // Create a map of questions for easy lookup
      const questionsMap = new Map();
      questions.forEach(q => questionsMap.set(q.id, q));

      // Process answers and calculate score
      let totalScore = 0;
      let maxScore = 0;
      const submissionAnswers = [];

      for (const answer of answers) {
        const question = questionsMap.get(answer.question_id);
        
        if (!question) {
          continue; // Skip if question not found
        }

        let isCorrect = false;
        let pointsEarned = 0;
        maxScore += question.points;

        // Check if answer is correct based on question type
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          isCorrect = answer.answer.toString() === question.correct_answer.toString();
          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.question_type === 'short_answer') {
          // For short answer, do a case-insensitive comparison
          isCorrect = answer.answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
          pointsEarned = isCorrect ? question.points : 0;
        } else {
          // For essay questions, no automatic grading
          isCorrect = null;
          pointsEarned = null;
        }

        totalScore += pointsEarned || 0;

        submissionAnswers.push({
          submission_id: submission.id,
          question_id: answer.question_id,
          answer: answer.answer,
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }

      // Insert submission answers
      const { error: answersError } = await supabase
        .from('submission_answers')
        .insert(submissionAnswers);

      if (answersError) {
        throw new ApiError(500, answersError.message);
      }

      // Update submission with score
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('exam_submissions')
        .update({
          score: totalScore,
          max_score: maxScore
        })
        .eq('id', submission.id)
        .select()
        .single();

      if (updateError) {
        throw new ApiError(500, updateError.message);
      }

      res.status(201).json({
        status: 'success',
        message: 'Exam submitted successfully',
        data: {
          submission: {
            id: updatedSubmission.id,
            student_name: updatedSubmission.student_name,
            matric_number: updatedSubmission.matric_number,
            score: updatedSubmission.score,
            max_score: updatedSubmission.max_score,
            completed_at: updatedSubmission.completed_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/submissions
 * @desc Get all submissions for an exam
 * @access Private (Teacher only)
 */
router.get(
  '/',
  requireTeacher,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { exam_id } = req.query;

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
        throw new ApiError(403, 'You do not have permission to view submissions for this exam');
      }

      // Get submissions for this exam
      const { data: submissions, error: submissionsError } = await supabase
        .from('exam_submissions')
        .select(`
          id,
          student_name,
          matric_number,
          score,
          max_score,
          started_at,
          completed_at
        `)
        .eq('exam_id', exam_id)
        .order('completed_at', { ascending: false });

      if (submissionsError) {
        throw new ApiError(500, submissionsError.message);
      }

      res.status(200).json({
        status: 'success',
        results: submissions.length,
        data: {
          submissions
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/submissions/:id
 * @desc Get a submission by ID
 * @access Private (Teacher only)
 */
router.get(
  '/:id',
  requireTeacher,
  [
    param('id').isUUID().withMessage('Invalid submission ID'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get submission with exam info
      const { data: submissionData, error: submissionError } = await supabase
        .from('exam_submissions')
        .select(`
          id,
          student_name,
          matric_number,
          score,
          max_score,
          started_at,
          completed_at,
          exam_id,
          exams:exam_id(id, title, teacher_id)
        `)
        .eq('id', id)
        .single();

      if (submissionError) {
        throw new ApiError(404, 'Submission not found');
      }

      // Check if user is the teacher of this exam
      if (submissionData.exams.teacher_id !== userId) {
        throw new ApiError(403, 'You do not have permission to view this submission');
      }

      // Get answers for this submission
      const { data: answers, error: answersError } = await supabase
        .from('submission_answers')
        .select(`
          id,
          question_id,
          answer,
          is_correct,
          points_earned,
          questions:question_id(id, question_text, question_type, options, correct_answer, points)
        `)
        .eq('submission_id', id);

      if (answersError) {
        throw new ApiError(500, answersError.message);
      }

      res.status(200).json({
        status: 'success',
        data: {
          submission: {
            ...submissionData,
            answers
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
