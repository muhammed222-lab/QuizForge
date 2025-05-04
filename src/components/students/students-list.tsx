import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentsApi } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  matric_number: string;
  email?: string;
  classes?: Array<{ id: string; name: string }>;
}

interface StudentsListProps {
  classId?: string;
  onAddStudent?: () => void;
  onEditStudent?: (student: Student) => void;
}

export function StudentsList({ classId, onAddStudent, onEditStudent }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await studentsApi.getStudents(classId);
        setStudents(response.data.students);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load students');
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        <p>{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No students</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding students to {classId ? 'this class' : 'your account'}.
        </p>
        {onAddStudent && (
          <div className="mt-6">
            <Button onClick={onAddStudent}>
              <svg
                className="-ml-0.5 mr-1.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Students
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Students ({students.length})
        </h2>
        {onAddStudent && (
          <Button onClick={onAddStudent} size="sm">
            <svg
              className="-ml-0.5 mr-1.5 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Students
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {students.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="bg-gray-50 pb-2 dark:bg-gray-800/80">
                  <CardTitle className="text-lg font-medium">{student.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Matric Number
                      </p>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-200">
                        {student.matric_number}
                      </p>
                    </div>
                    {student.email && (
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{student.email}</p>
                      </div>
                    )}
                    {student.classes && student.classes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                          Classes
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {student.classes.map((cls) => (
                            <span
                              key={cls.id}
                              className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {cls.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {onEditStudent && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStudent(student)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
