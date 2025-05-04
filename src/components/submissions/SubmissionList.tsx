import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { submissionsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Submission {
  id: string;
  student_name: string;
  matric_number: string;
  score: number;
  max_score: number;
  started_at: string;
  completed_at: string;
}

interface SubmissionListProps {
  examId: string;
  onViewSubmission?: (submission: Submission) => void;
  refreshTrigger?: number;
}

export function SubmissionList({ examId, onViewSubmission, refreshTrigger = 0 }: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await submissionsApi.getSubmissions(examId);
        
        if (response && response.data && response.data.submissions) {
          setSubmissions(response.data.submissions);
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [examId, refreshTrigger]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Submissions</CardTitle>
          <CardDescription>Loading submissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Submissions</CardTitle>
        <CardDescription>
          {submissions.length === 0
            ? 'No submissions yet'
            : `${submissions.length} student${submissions.length === 1 ? '' : 's'} have submitted this exam`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {submissions.length === 0 && !error ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500">No students have submitted this exam yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 px-4 pb-2">
              <div>Student</div>
              <div>Matric Number</div>
              <div>Score</div>
              <div>Submitted</div>
            </div>
            
            {submissions.map((submission) => {
              const percentage = calculatePercentage(submission.score, submission.max_score);
              const scoreColorClass = getScoreColor(percentage);
              
              return (
                <div
                  key={submission.id}
                  className="grid grid-cols-4 gap-4 items-center p-4 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{submission.student_name}</div>
                  <div>{submission.matric_number}</div>
                  <div className={`font-medium ${scoreColorClass}`}>
                    {submission.score}/{submission.max_score} ({percentage}%)
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(submission.completed_at)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubmission && onViewSubmission(submission)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubmissionList;
