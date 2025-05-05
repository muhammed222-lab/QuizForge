const express = require('express');
const { ApiError } = require('../middleware/errorHandler');
const supabase = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    // Get classes count
    const { count: totalClasses, error: classesError } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });

    if (classesError) throw new ApiError(500, classesError.message);

    // Get students count
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (studentsError) throw new ApiError(500, studentsError.message);

    // Get exams count
    const { count: totalExams, error: examsError } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });

    if (examsError) throw new ApiError(500, examsError.message);

    // Get active exams count - for now, just use a placeholder
    // In a real app, we would filter by status if that field exists
    let activeExams = 0;
    try {
      const { count, error } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (!error) {
        activeExams = count || 0;
      }
    } catch (err) {
      console.log('Error getting active exams count:', err);
      // Continue execution, don't throw error
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalClasses: totalClasses || 0,
        totalStudents: totalStudents || 0,
        totalExams: totalExams || 0,
        activeExams: activeExams || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/dashboard/recent
 * @desc Get recent classes and exams
 * @access Private
 */
router.get('/recent', authenticateToken, async (req, res, next) => {
  try {
    // Get recent classes (limit to 3)
    const { data: recentClasses, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(3);

    if (classesError) throw new ApiError(500, classesError.message);

    // Add some demo data for subject and grade level
    const classesWithDetails = (recentClasses || []).map(classItem => ({
      ...classItem,
      subject: ['Mathematics', 'Physics', 'English', 'History', 'Chemistry'][Math.floor(Math.random() * 5)],
      grade_level: ['9th Grade', '10th Grade', '11th Grade', '12th Grade'][Math.floor(Math.random() * 4)]
    }));

    // Get student counts for each class
    const classesWithStudentCount = await Promise.all(
      (classesWithDetails || []).map(async (classItem) => {
        const { count, error } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classItem.id);

        return {
          ...classItem,
          student_count: count || 0
        };
      })
    );

    // Get recent exams (limit to 3)
    const { data: recentExams, error: examsError } = await supabase
      .from('exams')
      .select('id, title, class_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (examsError) throw new ApiError(500, examsError.message);

    // Add a default status for each exam
    const examsWithStatus = (recentExams || []).map(exam => ({
      ...exam,
      status: Math.random() > 0.5 ? 'active' : 'completed' // Random status for demo
    }));

    // Get class names for each exam
    const examsWithClassNames = await Promise.all(
      (examsWithStatus || []).map(async (exam) => {
        const { data, error } = await supabase
          .from('classes')
          .select('name')
          .eq('id', exam.class_id)
          .single();

        return {
          ...exam,
          class_name: data?.name || 'Unknown Class'
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        recentClasses: classesWithStudentCount || [],
        recentExams: examsWithClassNames || []
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
