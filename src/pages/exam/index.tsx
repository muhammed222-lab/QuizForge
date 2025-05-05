import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { examsApi } from '@/lib/api';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  strict_timing: boolean;
  class_name: string;
}

export default function StudentExamPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      if (!id || !code) {
        setError('Invalid exam link. Please check the URL and try again.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await examsApi.getExamByCode(id, code);
        
        if (response && response.data) {
          setExam(response.data.exam);
          setQuestions(response.data.questions);
          
          // Initialize time remaining if there's a time limit
          if (response.data.exam.time_limit) {
            setTimeRemaining(response.data.exam.time_limit * 60); // Convert to seconds
          }
        } else {
          throw new Error('Failed to load exam');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError('Failed to load exam. The exam may have expired or the access code is invalid.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExam();
  }, [id, code]);
  
  // Timer effect
  useEffect(() => {
    if (!showIntro && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-submit when time is up if strict timing is enabled
            if (exam?.strict_timing) {
              handleSubmitExam();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [showIntro, timeRemaining, exam?.strict_timing]);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartExam = () => {
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!studentId.trim()) {
      setError('Please enter your student ID/matric number');
      return;
    }
    
    setError(null);
    setShowIntro(false);
  };
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmitExam = async () => {
    if (Object.keys(answers).length === 0) {
      setError('Please answer at least one question before submitting');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer
      }));
      
      const response = await examsApi.submitExam(id!, {
        code: code!,
        student_name: studentName,
        student_id: studentId,
        answers: formattedAnswers
      });
      
      if (response && response.data) {
        setExamResult(response.data);
      } else {
        throw new Error('Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (error && !exam) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render exam result
  if (examResult) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Exam Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/30">
                <h3 className="mb-2 text-xl font-semibold text-green-800 dark:text-green-200">
                  Your Score
                </h3>
                <div className="mb-4 text-4xl font-bold text-green-600 dark:text-green-400">
                  {examResult.score} / {examResult.max_score}
                </div>
                <div className="text-lg font-medium text-green-700 dark:text-green-300">
                  {examResult.percentage}%
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Exam Summary</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Exam</p>
                    <p className="font-medium">{exam?.title}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                    <p className="font-medium">{exam?.class_name}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                    <p className="font-medium">{studentName}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                    <p className="font-medium">{studentId}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
                <p className="text-center text-blue-800 dark:text-blue-200">
                  Thank you for completing this exam. Your results have been recorded.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.close()}>Close</Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Render intro screen
  if (showIntro && exam) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">{exam.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Exam Information</h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li><strong>Class:</strong> {exam.class_name}</li>
                  <li><strong>Time Limit:</strong> {exam.time_limit} minutes</li>
                  <li><strong>Questions:</strong> {questions.length}</li>
                  {exam.strict_timing && (
                    <li className="font-semibold text-amber-600 dark:text-amber-400">
                      Note: This exam has strict timing. It will be automatically submitted when the time is up.
                    </li>
                  )}
                </ul>
              </div>
              
              {exam.description && (
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p>{exam.description}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="font-semibold">Student Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Student ID/Matric Number"
                    placeholder="Enter your student ID or matric number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  {error}
                </div>
              )}
              
              <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/30">
                <p className="text-center text-amber-800 dark:text-amber-200">
                  By starting this exam, you agree to complete it honestly and without assistance.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                size="lg"
                onClick={handleStartExam}
              >
                Start Exam
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Render exam questions
  if (exam && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-3 dark:bg-gray-800">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Question</span>
            <span className="ml-2 font-medium">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          {timeRemaining !== null && (
            <div className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
          )}
          
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Student:</span>
            <span className="ml-2 font-medium">{studentName}</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex cursor-pointer items-center rounded-md border p-3 transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <span className="ml-3">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.question_type === 'true_false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center rounded-md border p-3 transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <span className="ml-3">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'essay') && (
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={currentQuestion.question_type === 'essay' ? 8 : 3}
                  placeholder={`Enter your ${currentQuestion.question_type === 'essay' ? 'essay' : 'answer'} here...`}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </div>
            )}
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  isLoading={submitting}
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                >
                  Next
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`h-8 w-8 rounded-full text-sm font-medium ${
                index === currentQuestionIndex
                  ? 'bg-green-600 text-white dark:bg-green-700'
                  : answers[questions[index].id]
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  return null;
}
