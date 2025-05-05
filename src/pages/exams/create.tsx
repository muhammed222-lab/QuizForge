import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader } from '@/components/layout/main-content';
import { Skeleton } from '@/components/ui/skeleton';
import { classesApi, examsApi } from '@/lib/api';

interface ClassOption {
  id: string;
  name: string;
}

interface MaterialOption {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
}

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [classesLoading, setClassesLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);

  // We'll use a single loading state for the entire form
  const loading = classesLoading || materialsLoading || generatingQuestions;

  const [formData, setFormData] = useState({
    title: '',
    classId: '',
    questionCount: 10,
    questionType: 'multiple-choice',
    timeLimit: 30,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    shuffleQuestions: true,
    shuffleAnswers: true,
    strictTiming: false,
    selectedMaterials: [] as string[],
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Use the classesApi to fetch classes
        const response = await classesApi.getClasses();

        if (response && response.data && response.data.classes) {
          // Transform the API response to match our interface
          const formattedClasses = response.data.classes.map((cls: any) => ({
            id: cls.id,
            name: cls.name
          }));

          setClasses(formattedClasses);
        } else {
          // If no classes are returned, set an empty array
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch materials for a specific class
  const fetchMaterials = async (selectedClassId: string) => {
    setMaterialsLoading(true);
    try {
      // Use the API to fetch materials for the selected class
      const response = await classesApi.getClassMaterials(selectedClassId);

      if (response && response.data && response.data.materials) {
        // Transform the API response to match our interface
        const formattedMaterials = response.data.materials.map((material: any) => ({
          id: material.id,
          name: material.name || `File ${material.id}`,
          file_path: material.file_path || '',
          file_type: material.file_type || 'unknown'
        }));

        setMaterials(formattedMaterials);
      } else {
        // If no materials are returned, set an empty array
        setMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If class is changed, fetch materials for that class
    if (name === 'classId' && value) {
      fetchMaterials(value);
      setFormData((prev) => ({ ...prev, selectedMaterials: [] }));
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    setFormData((prev) => {
      const selectedMaterials = [...prev.selectedMaterials];
      if (selectedMaterials.includes(materialId)) {
        return {
          ...prev,
          selectedMaterials: selectedMaterials.filter((id) => id !== materialId),
        };
      } else {
        return {
          ...prev,
          selectedMaterials: [...selectedMaterials, materialId],
        };
      }
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({ ...prev, deadline: date }));
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.classId) {
      setError('Please select a class');
      return;
    }

    if (currentStep === 2 && formData.selectedMaterials.length === 0) {
      setError('Please select at least one material');
      return;
    }

    setError(null);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setError(null);

    try {
      // Create the exam using the API
      const examData = {
        title: formData.title,
        class_id: formData.classId,
        question_count: formData.questionCount,
        question_type: formData.questionType,
        time_limit: formData.timeLimit,
        deadline: formData.deadline.toISOString(),
        shuffle_questions: formData.shuffleQuestions,
        shuffle_answers: formData.shuffleAnswers,
        strict_timing: formData.strictTiming,
        material_ids: formData.selectedMaterials
      };

      const response = await examsApi.createExam(examData);

      if (response && response.data && response.data.exam) {
        // Redirect to the edit page for the new exam
        navigate(`/app/exams/edit/${response.data.exam.id}`);
      } else {
        throw new Error('Failed to create exam');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setGeneratingQuestions(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Exam Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Midterm Exam"
                required
              />

              <div className="space-y-1">
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                {classesLoading ? (
                  <Skeleton height={38} />
                ) : (
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="" disabled>Select a class</option>
                    {classes.map((classOption) => (
                      <option key={classOption.id} value={classOption.id}>
                        {classOption.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>
                  <select
                    id="questionType"
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <Slider
                  label="Number of Questions"
                  min={5}
                  max={50}
                  step={5}
                  value={formData.questionCount}
                  onChange={(e) => handleSliderChange('questionCount', Number(e.target.value))}
                  showValue
                />
              </div>

              <Slider
                label="Time Limit (minutes)"
                min={10}
                max={180}
                step={5}
                value={formData.timeLimit}
                onChange={(e) => handleSliderChange('timeLimit', Number(e.target.value))}
                showValue
                valueSuffix=" min"
              />

              <DatePicker
                label="Deadline"
                value={formData.deadline}
                onChange={handleDateChange}
                minDate={new Date()}
                showTimeSelect
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Select the materials that will be used to generate questions for this exam.
                The AI will analyze these materials and create relevant questions.
              </p>

              {materialsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={50} />
                  ))}
                </div>
              ) : materials.length > 0 ? (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${
                        formData.selectedMaterials.includes(material.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMaterialToggle(material.id)}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                          {material.file_type === 'pdf' ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{material.name}</p>
                          <p className="text-xs text-gray-500">{material.file_type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                        {formData.selectedMaterials.includes(material.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-3 w-3 rounded-full bg-primary-500"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
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
                  <h3 className="mb-2 text-lg font-medium">No materials found</h3>
                  <p className="text-sm text-gray-500">
                    Upload materials to this class before creating an exam.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Exam Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Switch
                label="Shuffle Questions"
                description="Randomize the order of questions for each student"
                checked={formData.shuffleQuestions}
                onChange={(e) => handleSwitchChange('shuffleQuestions', e.target.checked)}
              />

              <Switch
                label="Shuffle Answers"
                description="Randomize the order of answer options for each question"
                checked={formData.shuffleAnswers}
                onChange={(e) => handleSwitchChange('shuffleAnswers', e.target.checked)}
              />

              <Switch
                label="Strict Timing"
                description="Automatically submit when time expires"
                checked={formData.strictTiming}
                onChange={(e) => handleSwitchChange('strictTiming', e.target.checked)}
              />

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">AI-Generated Questions</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        The AI will generate {formData.questionCount + 5} questions (5 extra for variety).
                        You'll be able to review and edit these questions before finalizing the exam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Generate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium">Exam Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Title:</div>
                  <div>{formData.title || 'Untitled Exam'}</div>

                  <div className="text-gray-500">Class:</div>
                  <div>{classes.find((c) => c.id === formData.classId)?.name || 'None'}</div>

                  <div className="text-gray-500">Question Type:</div>
                  <div>
                    {formData.questionType === 'multiple-choice'
                      ? 'Multiple Choice'
                      : formData.questionType === 'true-false'
                      ? 'True/False'
                      : 'Mixed'}
                  </div>

                  <div className="text-gray-500">Questions:</div>
                  <div>{formData.questionCount}</div>

                  <div className="text-gray-500">Time Limit:</div>
                  <div>{formData.timeLimit} minutes</div>

                  <div className="text-gray-500">Deadline:</div>
                  <div>{formData.deadline.toLocaleDateString()} {formData.deadline.toLocaleTimeString()}</div>

                  <div className="text-gray-500">Materials:</div>
                  <div>{formData.selectedMaterials.length} selected</div>

                  <div className="text-gray-500">Shuffle Questions:</div>
                  <div>{formData.shuffleQuestions ? 'Yes' : 'No'}</div>

                  <div className="text-gray-500">Shuffle Answers:</div>
                  <div>{formData.shuffleAnswers ? 'Yes' : 'No'}</div>

                  <div className="text-gray-500">Strict Timing:</div>
                  <div>{formData.strictTiming ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Once you click "Generate Questions", the AI will analyze your selected materials
                        and create questions based on them. This process may take a few minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleGenerateQuestions}
                isLoading={generatingQuestions}
              >
                {generatingQuestions ? 'Generating Questions...' : 'Generate Questions'}
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create New Exam"
        description="Set up an AI-powered exam for your class"
        breadcrumbs={[
          { label: 'Exams', href: '/exams' },
          { label: 'Create New Exam' },
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex w-full items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex w-full items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium ${
                    currentStep === step
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : currentStep > step
                      ? 'border-primary-500 bg-primary-100 text-primary-500'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {currentStep > step ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <div
                  className={`h-1 w-full ${
                    step < 4
                      ? currentStep > step
                        ? 'bg-primary-500'
                        : 'bg-gray-300'
                      : 'hidden'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 text-center text-sm">
          <div className={currentStep === 1 ? 'font-medium text-primary-700' : 'text-gray-500'}>
            Basic Info
          </div>
          <div className={currentStep === 2 ? 'font-medium text-primary-700' : 'text-gray-500'}>
            Materials
          </div>
          <div className={currentStep === 3 ? 'font-medium text-primary-700' : 'text-gray-500'}>
            Settings
          </div>
          <div className={currentStep === 4 ? 'font-medium text-primary-700' : 'text-gray-500'}>
            Review
          </div>
        </div>
      </div>

      <AnimatedContainer animation="fade" className="max-w-2xl">
        {renderStepContent()}

        {currentStep < 4 && (
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/exams')}
              disabled={loading}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </AnimatedContainer>
    </div>
  );
}
