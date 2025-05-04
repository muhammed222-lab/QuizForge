import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { studentsApi } from '@/lib/api';

interface CreateStudentFormProps {
  classId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateStudentForm({ classId, onSuccess, onCancel }: CreateStudentFormProps) {
  const [students, setStudents] = useState<Array<{ name: string; matric_number: string; email?: string }>>([
    { name: '', matric_number: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matricFormat, setMatricFormat] = useState('XX-XX-XXXX');

  const handleAddStudent = () => {
    setStudents([...students, { name: '', matric_number: '' }]);
  };

  const handleRemoveStudent = (index: number) => {
    if (students.length > 1) {
      const newStudents = [...students];
      newStudents.splice(index, 1);
      setStudents(newStudents);
    }
  };

  const handleStudentChange = (index: number, field: 'name' | 'matric_number' | 'email', value: string) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setStudents(newStudents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate students
    const emptyFields = students.some(student => !student.name || !student.matric_number);
    if (emptyFields) {
      setError('All students must have a name and matric number');
      setLoading(false);
      return;
    }

    try {
      // Create students using the API
      await studentsApi.createStudents({
        students,
        class_id: classId,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl dark:text-white">Add Students</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Create student accounts with matric numbers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Matric Number Format
            </label>
            <div className="mt-1">
              <Input
                type="text"
                value={matricFormat}
                onChange={(e) => setMatricFormat(e.target.value)}
                placeholder="e.g., XX-XX-XXXX"
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use X for any character, 9 for numbers only. Example: XX-99-XXXX
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {students.map((student, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student {index + 1}
                  </h4>
                  {students.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStudent(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={student.name}
                    onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                    required
                  />
                  <Input
                    label="Matric Number"
                    type="text"
                    placeholder={matricFormat}
                    value={student.matric_number}
                    onChange={(e) => handleStudentChange(index, 'matric_number', e.target.value)}
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Email (Optional)"
                      type="email"
                      placeholder="student@example.com"
                      value={student.email || ''}
                      onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddStudent}
            className="w-full border-dashed border-gray-300 dark:border-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Another Student
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              isLoading={loading}
            >
              Create Students
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
