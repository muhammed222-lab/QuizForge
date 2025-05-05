import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { examsApi } from '@/lib/api';

interface Exam {
  id: string;
  title: string;
  class_name: string;
  class_id: string;
  status: 'draft' | 'active' | 'completed';
  question_count: number;
  time_limit: number;
  created_at: string;
  deadline: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        // Use the examsApi to fetch exams
        const response = await examsApi.getExams();

        if (response && response.data && response.data.exams) {
          // Transform the API response to match our interface
          const formattedExams = response.data.exams.map((exam: any) => ({
            id: exam.id,
            title: exam.title,
            class_name: exam.class_name || 'Unnamed Class',
            class_id: exam.class_id,
            status: exam.status as 'draft' | 'active' | 'completed',
            question_count: exam.question_count || 0,
            time_limit: exam.time_limit || 60,
            created_at: new Date(exam.created_at).toISOString().split('T')[0],
            deadline: exam.deadline ? new Date(exam.deadline).toISOString().split('T')[0] : 'No deadline'
          }));

          setExams(formattedExams);
        } else {
          // If no exams are returned, set an empty array
          setExams([]);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        // In case of error, set empty exams array
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Get unique classes and statuses for filters
  const classes = [...new Set(exams.map((e) => e.class_name))];
  const statuses = [...new Set(exams.map((e) => e.status))];

  // Filter exams based on search query and selected filters
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = searchQuery
      ? exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? exam.status === statusFilter : true;
    const matchesClass = classFilter ? exam.class_name === classFilter : true;

    return matchesSearch && matchesStatus && matchesClass;
  });

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Exams"
        description="Create and manage your exams and quizzes"
        actions={
          <Link to="/app/exams/create">
            <Button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create New Exam
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={classFilter || ''}
                onChange={(e) => setClassFilter(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <PageSection>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <AnimatedContainer
            animation="fade"
            staggerChildren={true}
            staggerDelay={0.05}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <Link key={exam.id} to={`/app/exams/edit/${exam.id}`}>
                  <Card animate={true} className="h-full cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{exam.title}</h3>
                      <p className="mb-4 text-sm text-gray-500">{exam.class_name}</p>
                      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {exam.question_count} Questions
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {exam.time_limit} min
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Deadline: {new Date(exam.deadline).toLocaleDateString()}
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-medium">No exams found</h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </AnimatedContainer>
        )}
      </PageSection>
    </div>
  );
}
