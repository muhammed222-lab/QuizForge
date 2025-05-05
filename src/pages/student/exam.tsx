import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { submissionsApi } from '@/lib/api';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
}

interface Exam {
  id: string;
  title: string;
  description: string;
  time_limit?: number;
  strict_timing?: boolean;
  class_name: string;
}

const StudentExamPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [studentName, setStudentName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [currentStep, setCurrentStep] = useState('login'); // login, exam, submitted
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      if (!id || !code) {
        setError('Invalid exam link. Please check the URL and try again.');
        setLoading(false);
        return;
      }

      try {
        // In a real implementation, this would call the API
        // For now, we'll simulate the API call
        const response = await fetch(`/api/exams/${id}/access?code=${code}`);
        
        if (!response.ok) {
          throw new Error('Invalid exam code or exam not found');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setExam(data.data.exam);
          setQuestions(data.data.questions);
          
          // Initialize time limit if provided
          if (data.data.exam.time_limit) {
            setTimeLeft(data.data.exam.time_limit * 60); // Convert to seconds
          }
        } else {
          throw new Error(data.message || 'Failed to load exam');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, code]);

  // Timer countdown
  useEffect(() => {
    if (currentStep !== 'exam' || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          // Auto-submit when time is up
          if (exam?.strict_timing) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, timeLeft, exam?.strict_timing]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!matricNumber.trim()) {
      setError('Please enter your matric number');
      return;
    }
    
    setCurrentStep('exam');
    setError(null);
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    
    if (unansweredQuestions.length > 0) {
      if (!window.confirm(`You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer
      }));
      
      // Submit exam
      const response = await submissionsApi.submitExam({
        exam_id: id!,
        access_code: code!,
        student_name: studentName,
        matric_number: matricNumber,
        answers: formattedAnswers
      });
      
      if (response && response.status === 'success') {
        setCurrentStep('submitted');
      } else {
        throw new Error(response?.message || 'Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading the exam</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'login') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{exam?.title || 'Exam Login'}</CardTitle>
              <CardDescription>
                {exam?.class_name ? `Class: ${exam.class_name}` : 'Please enter your details to start the exam'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matric">Matric Number</Label>
                  <Input
                    id="matric"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    placeholder="Enter your matric number"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  Start Exam
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'submitted') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Exam Submitted</CardTitle>
              <CardDescription>Thank you for completing the exam</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="mb-4">Your answers have been recorded successfully.</p>
              <p className="text-sm text-gray-500">
                You may close this window now.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{exam?.title}</CardTitle>
              <CardDescription>{exam?.class_name}</CardDescription>
            </div>
            {timeLeft !== null && (
              <div className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-500' : ''}`}>
                Time Left: {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p>{exam?.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="font-medium">Student:</span> {studentName}
            </div>
            <div>
              <span className="font-medium">Matric Number:</span> {matricNumber}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Question {index + 1}: {question.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.question_type === 'multiple_choice' && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                >
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-opt${optIndex}`} />
                        <Label htmlFor={`q${question.id}-opt${optIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.question_type === 'true_false' && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id={`q${question.id}-true`} />
                      <Label htmlFor={`q${question.id}-true`}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id={`q${question.id}-false`} />
                      <Label htmlFor={`q${question.id}-false`}>False</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {question.question_type === 'short_answer' && (
                <Textarea
                  value={answers[question.id]?.toString() || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Enter your answer here"
                  className="min-h-[100px]"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="px-8"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </Button>
      </div>
    </div>
  );
};

export default StudentExamPage;
