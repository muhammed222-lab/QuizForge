import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

// No mock data needed

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all
  const [classFilter, setClassFilter] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    averageScore: 0,
    completionRate: 0,
  });

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch analytics data from API
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .order('name');

        if (classesError) throw classesError;

        // Get exam stats
        const { data: examsData, error: examsError } = await supabase
          .from('exams')
          .select('*');

        if (examsError) throw examsError;

        // Get student stats
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');

        if (studentsError) throw studentsError;

        // Calculate stats
        const totalExams = examsData?.length || 0;
        const totalStudents = studentsData?.length || 0;

        // Set the data
        setStats({
          totalExams,
          totalStudents,
          averageScore: 0, // Would calculate from actual data
          completionRate: 0, // Would calculate from actual data
        });

        setClasses(classesData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, classFilter]);

  // This would be a real chart component in a production app
  // For this example, we'll just render placeholders
  const renderChartPlaceholder = (height: number, title: string) => (
    <div className="flex flex-col">
      <h3 className="mb-2 text-sm font-medium text-black">{title}</h3>
      {loading ? (
        <Skeleton height={height} />
      ) : (
        <div
          className="flex items-center justify-center rounded-md bg-gray-100"
          style={{ height: `${height}px` }}
        >
          <p className="text-black">Chart visualization would render here</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Insights and statistics about your exams and student performance"
        actions={
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Report
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black">
                Time Range
              </label>
              <div className="mt-1 flex space-x-2">
                {[
                  { value: '1m', label: '1 Month' },
                  { value: '3m', label: '3 Months' },
                  { value: '6m', label: '6 Months' },
                  { value: '1y', label: '1 Year' },
                  { value: 'all', label: 'All Time' },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      timeRange === option.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setTimeRange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Class
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={classFilter || ''}
                onChange={(e) => setClassFilter(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <AnimatedContainer
        animation="fade"
        staggerChildren={true}
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: 'Total Exams', value: stats.totalExams, icon: '📝', color: 'bg-primary-50 text-primary-700' },
          { title: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: 'bg-secondary-50 text-secondary-700' },
          { title: 'Average Score', value: `${stats.averageScore}%`, icon: '📊', color: 'bg-accent-50 text-accent-700' },
          { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: '✅', color: 'bg-green-50 text-green-700' },
        ].map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <Skeleton height={24} width={120} className="mb-2" />
                <Skeleton height={36} width={80} />
              </div>
            ) : (
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">{stat.title}</p>
                    <h3 className="mt-1 text-3xl font-semibold text-black">{stat.value}</h3>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </AnimatedContainer>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChartPlaceholder(300, 'Bar Chart')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChartPlaceholder(300, 'Line Chart')}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Types</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChartPlaceholder(300, 'Pie Chart')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChartPlaceholder(300, 'Radar Chart')}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <PageSection title="Top Performing Students" description="Students with the highest average scores">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={60} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Exams Taken
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Average Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? [] : [].map((student, index) => (
                  <tr key={student.rank} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        {student.rank}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{student.class}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{student.exams}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-green-600">{student.score}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      {/* Challenging Questions */}
      <PageSection title="Most Challenging Questions" description="Questions with the lowest correct answer rates">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? [] : [].map((question) => (
              <Card key={question.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-medium">{question.text}</h3>
                      <p className="text-sm text-gray-500">{question.exam}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        {question.correctRate} correct
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type: {question.type}</span>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>
    </div>
  );
}
