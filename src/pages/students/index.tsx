import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { StudentsList } from '@/components/students/students-list';
import { CreateStudentForm } from '@/components/students/create-student-form';

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);



  return (
    <div className="space-y-8">
      <PageHeader
        title="Students"
        description="Manage your students and their matric numbers"
        actions={
          <Button onClick={() => setShowAddStudentModal(true)}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Students
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Search students by name or matric number..."
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-green-400 dark:focus:ring-green-400"
                value={classFilter || ''}
                onChange={(e) => setClassFilter(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {/* Class options will be populated from API */}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <PageSection>
        <StudentsList
          classId={classFilter || undefined}
          onAddStudent={() => setShowAddStudentModal(true)}
          onEditStudent={(student) => {
            console.log('Edit student:', student);
            // Implement edit functionality
          }}
        />
      </PageSection>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <AnimatedContainer
            animation="scale"
            className="w-full max-w-2xl"
          >
            <CreateStudentForm
              classId={classFilter || undefined}
              onSuccess={() => {
                setShowAddStudentModal(false);
                // Refresh student list
                window.location.reload();
              }}
              onCancel={() => setShowAddStudentModal(false)}
            />
          </AnimatedContainer>
        </div>
      )}
    </div>
  );
}
