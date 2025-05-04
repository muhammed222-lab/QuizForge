import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { SkeletonCard } from '@/components/ui/skeleton';
import { classesApi } from '@/lib/api';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  description: string;
  student_count: number;
  created_at: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // Use the classesApi to fetch classes
        const response = await classesApi.getClasses();

        if (response && response.data && response.data.classes) {
          // Transform the API response to match our interface
          const formattedClasses = response.data.classes.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            subject: cls.subject || 'General',
            grade_level: cls.grade_level || 'All Grades',
            description: cls.description || 'No description available',
            student_count: cls.student_count || 0,
            created_at: new Date(cls.created_at).toISOString().split('T')[0]
          }));

          setClasses(formattedClasses);
        } else {
          // If no classes are returned, set an empty array
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        // In case of error, set empty classes array
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Get unique subjects and grade levels for filters
  const subjects = [...new Set(classes.map((c) => c.subject))];
  const gradeLevels = [...new Set(classes.map((c) => c.grade_level))];

  // Filter classes based on search query and selected filters
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = searchQuery
      ? classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesSubject = selectedSubject ? classItem.subject === selectedSubject : true;
    const matchesGradeLevel = selectedGradeLevel ? classItem.grade_level === selectedGradeLevel : true;

    return matchesSearch && matchesSubject && matchesGradeLevel;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes"
        description="Manage your classes and student rosters"
        actions={
          <Link to="/app/classes/create">
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
          </Link>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search classes..."
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
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value || null)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={selectedGradeLevel || ''}
                onChange={(e) => setSelectedGradeLevel(e.target.value || null)}
              >
                <option value="">All Grade Levels</option>
                {gradeLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
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
            {filteredClasses.length > 0 ? (
              filteredClasses.map((classItem) => (
                <Link key={classItem.id} to={`/classes/${classItem.id}`}>
                  <Card animate={true} className="h-full cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                          {classItem.subject.charAt(0)}
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          {classItem.grade_level}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{classItem.name}</h3>
                      <p className="mb-4 text-sm text-gray-500">{classItem.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-4 w-4"
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
                          {classItem.student_count} Students
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
                <h3 className="mb-2 text-lg font-medium">No classes found</h3>
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
