import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

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
        // In a real app, these would be actual Supabase queries
        // For now, we'll simulate loading and then set mock data
        setTimeout(() => {
          setStats({
            totalClasses: 5,
            totalStudents: 120,
            totalExams: 12,
            activeExams: 3,
          });

          setRecentClasses([
            { id: 1, name: 'Mathematics 101', subject: 'Mathematics', grade_level: '9th Grade', student_count: 28 },
            { id: 2, name: 'Physics Fundamentals', subject: 'Physics', grade_level: '10th Grade', student_count: 24 },
            { id: 3, name: 'English Literature', subject: 'English', grade_level: '11th Grade', student_count: 32 },
          ]);

          setRecentExams([
            { id: 1, title: 'Algebra Mid-term', class_name: 'Mathematics 101', created_at: '2023-05-01', status: 'active' },
            { id: 2, title: 'Physics Quiz 3', class_name: 'Physics Fundamentals', created_at: '2023-04-28', status: 'completed' },
            { id: 3, title: 'Shakespeare Analysis', class_name: 'English Literature', created_at: '2023-04-25', status: 'draft' },
          ]);

          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Classes', value: stats?.totalClasses || 0, icon: '📚', color: 'bg-primary-50 text-primary-700' },
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: '👨‍🎓', color: 'bg-secondary-50 text-secondary-700' },
    { title: 'Total Exams', value: stats?.totalExams || 0, icon: '📝', color: 'bg-accent-50 text-accent-700' },
    { title: 'Active Exams', value: stats?.activeExams || 0, icon: '🔔', color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your classes, students, and exams"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Class
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
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="mt-1 text-3xl font-semibold">{stat.value}</h3>
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
                        className="mr-2 h-5 w-5 text-gray-500"
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
                      <span>{classItem.student_count} Students</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View
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
                          ? 'bg-green-100 text-green-800'
                          : exam.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View
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
