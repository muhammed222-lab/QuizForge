import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { submissionsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer?: string | number;
  points: number;
}

interface Answer {
  id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  points_earned: number;
  questions: Question;
}

interface Submission {
  id: string;
  student_name: string;
  matric_number: string;
  score: number;
  max_score: number;
  started_at: string;
  completed_at: string;
  answers: Answer[];
}

interface SubmissionDetailProps {
  submissionId: string;
  onBack?: () => void;
}

export function SubmissionDetail({ submissionId, onBack }: SubmissionDetailProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await submissionsApi.getSubmission(submissionId);
        
        if (response && response.data && response.data.submission) {
          setSubmission(response.data.submission);
        } else {
          throw new Error('Failed to fetch submission details');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderAnswer = (answer: Answer) => {
    const { questions: question } = answer;
    
    if (question.question_type === 'multiple_choice' && question.options) {
      const selectedOption = question.options[parseInt(answer.answer)];
      const correctOption = question.options[parseInt(question.correct_answer as string)];
      
      return (
        <div>
          <p className="font-medium">Selected: <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>{selectedOption}</span></p>
          {!answer.is_correct && (
            <p className="text-sm text-green-600 mt-1">Correct: {correctOption}</p>
          )}
        </div>
      );
    }
    
    if (question.question_type === 'true_false') {
      const selected = answer.answer === '0' ? 'True' : 'False';
      const correct = question.correct_answer === 0 ? 'True' : 'False';
      
      return (
        <div>
          <p className="font-medium">Selected: <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>{selected}</span></p>
          {!answer.is_correct && (
            <p className="text-sm text-green-600 mt-1">Correct: {correct}</p>
          )}
        </div>
      );
    }
    
    if (question.question_type === 'short_answer') {
      return (
        <div>
          <p className="font-medium">Answer: <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>{answer.answer}</span></p>
          {!answer.is_correct && (
            <p className="text-sm text-green-600 mt-1">Correct: {question.correct_answer}</p>
          )}
        </div>
      );
    }
    
    return (
      <div>
        <p className="font-medium">Answer: {answer.answer}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
          <CardDescription>Loading submission...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-md">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <div className="mt-4">
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>There was a problem loading the submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Not Found</CardTitle>
          <CardDescription>The requested submission could not be found</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const percentage = calculatePercentage(submission.score, submission.max_score);
  const scoreColorClass = getScoreColor(percentage);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Submission Details</CardTitle>
            <CardDescription>
              Submitted on {formatDate(submission.completed_at)}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back to List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Student</h3>
              <p className="font-medium">{submission.student_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Matric Number</h3>
              <p>{submission.matric_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Score</h3>
              <p className={`font-medium ${scoreColorClass}`}>
                {submission.score}/{submission.max_score} ({percentage}%)
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time Taken</h3>
              <p>
                {new Date(submission.started_at).toLocaleTimeString()} - {new Date(submission.completed_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium">Answers</h3>
          
          <div className="space-y-4">
            {submission.answers.map((answer, index) => (
              <div key={answer.id} className="p-4 border rounded-md">
                <div className="flex justify-between">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                      {answer.points_earned}/{answer.questions.points} points
                    </span>
                    <span className={`inline-block w-4 h-4 rounded-full ${answer.is_correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center text-xs`}>
                      {answer.is_correct ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                <p className="mt-2">{answer.questions.question_text}</p>
                <div className="mt-4">
                  {renderAnswer(answer)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubmissionDetail;
