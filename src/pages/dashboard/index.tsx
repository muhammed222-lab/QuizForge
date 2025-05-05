import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalExams: number;
  activeExams: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await dashboardApi.getStats();
        if (statsResponse && statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Fetch recent classes and exams
        const recentResponse = await dashboardApi.getRecent();
        if (recentResponse && recentResponse.data) {
          setRecentClasses(recentResponse.data.recentClasses || []);
          setRecentExams(recentResponse.data.recentExams || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Classes', value: stats?.totalClasses || 0, icon: '📚', color: 'bg-primary-900 text-primary-400' },
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: '👨‍🎓', color: 'bg-secondary-900 text-secondary-400' },
    { title: 'Total Exams', value: stats?.totalExams || 0, icon: '📝', color: 'bg-accent-900 text-accent-400' },
    { title: 'Active Exams', value: stats?.activeExams || 0, icon: '🔔', color: 'bg-green-900 text-green-400' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your classes, students, and exams"
        actions={
          <Button asChild>
            <Link to="/app/classes/create">
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
              Create New Class
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <AnimatedContainer
        animation="fade"
        staggerChildren={true}
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, index) => (
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
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <h3 className="mt-1 text-3xl font-semibold text-gray-100">{stat.value}</h3>
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

      {/* Recent Classes */}
      <PageSection title="Recent Classes" description="Your most recently created classes">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentClasses.map((classItem) => (
              <Card key={classItem.id} animate={true} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{classItem.name}</CardTitle>
                  <CardDescription>{classItem.subject} - {classItem.grade_level}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-gray-300">{classItem.student_count} Students</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/classes/${classItem.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>

      {/* Recent Exams */}
      <PageSection title="Recent Exams" description="Your most recently created exams">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentExams.map((exam) => (
              <Card key={exam.id} animate={true} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{exam.title}</CardTitle>
                  <CardDescription>{exam.class_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        exam.status === 'active'
                          ? 'bg-green-900 text-green-400'
                          : exam.status === 'completed'
                          ? 'bg-blue-900 text-blue-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/exams/${exam.id}`}>View</Link>
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
