import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { AnimatedContainer } from '@/components/ui/animated-container';
import MaterialUpload from '@/components/materials/MaterialUpload';
import MaterialList from '@/components/materials/MaterialList';
import { classesApi } from '@/lib/api';

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  teacher_id: string;
  created_at: string;
}

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshMaterials, setRefreshMaterials] = useState(0);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await classesApi.getClass(id);
        
        if (response && response.data && response.data.class) {
          setClassDetails(response.data.class);
        } else {
          throw new Error('Failed to fetch class details');
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [id]);

  const handleMaterialUploadSuccess = () => {
    // Trigger a refresh of the materials list
    setRefreshMaterials(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={<Skeleton className="h-8 w-64" />}
          description={<Skeleton className="h-4 w-48" />}
          breadcrumbs={[
            { label: 'Classes', href: '/app/classes' },
            { label: <Skeleton className="h-4 w-24 inline-block" /> },
          ]}
        />
        
        <AnimatedContainer animation="fade">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Class Not Found"
          description="We couldn't find the class you're looking for"
          breadcrumbs={[
            { label: 'Classes', href: '/app/classes' },
            { label: 'Not Found' },
          ]}
        />
        
        <AnimatedContainer animation="fade">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem loading the class</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error || 'Class not found'}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/app/classes')}>
                Back to Classes
              </Button>
            </CardFooter>
          </Card>
        </AnimatedContainer>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={classDetails.name}
        description={`${classDetails.subject} - ${classDetails.grade_level}`}
        breadcrumbs={[
          { label: 'Classes', href: '/app/classes' },
          { label: classDetails.name },
        ]}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/app/classes/${id}/edit`)}
            >
              Edit Class
            </Button>
            <Button
              onClick={() => navigate(`/app/exams/create?classId=${id}`)}
            >
              Create Exam
            </Button>
          </div>
        }
      />
      
      <AnimatedContainer animation="fade">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                    <p className="mt-1">{classDetails.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Grade Level</h3>
                    <p className="mt-1">{classDetails.grade_level}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">{classDetails.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1">{new Date(classDetails.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <PageSection
              title="Quick Actions"
              description="What would you like to do next?"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('materials')}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Upload Materials</h3>
                    <p className="text-sm text-gray-500">
                      Add learning materials for your students
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/app/exams/create?classId=${id}`)}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Create Exam</h3>
                    <p className="text-sm text-gray-500">
                      Generate AI-powered exams from your materials
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('students')}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Manage Students</h3>
                    <p className="text-sm text-gray-500">
                      Add or remove students from this class
                    </p>
                  </CardContent>
                </Card>
              </div>
            </PageSection>
          </TabsContent>
          
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MaterialList 
                  classId={id!} 
                  refreshTrigger={refreshMaterials}
                />
              </div>
              <div>
                <MaterialUpload 
                  classId={id!} 
                  onSuccess={handleMaterialUploadSuccess}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exams</CardTitle>
                <CardDescription>Manage exams for this class</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  No exams created yet. Create your first exam to get started.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/app/exams/create?classId=${id}`)}
                >
                  Create New Exam
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage students in this class</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  No students added yet. Add students to this class to get started.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Add Students
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </div>
  );
}
