import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageHeader, PageSection } from '@/components/layout/main-content';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { examsApi } from '@/lib/api';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
}

export default function EditExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [examTitle, setExamTitle] = useState('');
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        // In a real app, this would be an actual Supabase query
        // For now, we'll simulate loading and then set mock data
        setTimeout(() => {
          setExamTitle('Algebra Mid-term Exam');

          const mockQuestions: Question[] = [
            {
              id: '1',
              text: 'What is the value of x in the equation 2x + 5 = 15?',
              type: 'multiple-choice',
              options: ['5', '7.5', '10', '5.5'],
              correctAnswer: 0,
            },
            {
              id: '2',
              text: 'The quadratic formula is used to solve equations of the form ax² + bx + c = 0.',
              type: 'true-false',
              options: ['True', 'False'],
              correctAnswer: 0,
            },
            {
              id: '3',
              text: 'Which of the following is a solution to the equation x² - 4 = 0?',
              type: 'multiple-choice',
              options: ['x = 2', 'x = ±2', 'x = 4', 'x = ±4'],
              correctAnswer: 1,
            },
            {
              id: '4',
              text: 'The slope of a line can be calculated using the formula m = (y₂ - y₁) / (x₂ - x₁).',
              type: 'true-false',
              options: ['True', 'False'],
              correctAnswer: 0,
            },
            {
              id: '5',
              text: 'What is the result of factoring x² - 9?',
              type: 'multiple-choice',
              options: ['(x - 3)(x + 3)', '(x - 9)(x + 1)', '(x - 3)²', '(x + 3)²'],
              correctAnswer: 0,
            },
          ];

          setQuestions(mockQuestions);
          setEditingQuestion(mockQuestions[0]);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching exam:', error);
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleQuestionChange = (field: string, value: string) => {
    if (!editingQuestion) return;

    setEditingQuestion((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!editingQuestion) return;

    setEditingQuestion((prev) => {
      if (!prev) return null;
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleCorrectAnswerChange = (index: number) => {
    if (!editingQuestion) return;

    setEditingQuestion((prev) => {
      if (!prev) return null;
      return { ...prev, correctAnswer: index };
    });
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[currentQuestionIndex] = editingQuestion;
      return newQuestions;
    });

    setSuccess('Question saved successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
    setEditingQuestion(newQuestion);
  };

  const handleDeleteQuestion = () => {
    if (questions.length <= 1) {
      setError('Cannot delete the only question');
      return;
    }

    setQuestions((prev) => {
      const newQuestions = prev.filter((_, index) => index !== currentQuestionIndex);
      return newQuestions;
    });

    const newIndex = currentQuestionIndex >= questions.length - 1 ? questions.length - 2 : currentQuestionIndex;
    setCurrentQuestionIndex(newIndex);
    setEditingQuestion(questions[newIndex]);
  };

  const handleNavigateQuestion = (index: number) => {
    // Save current question before navigating
    if (editingQuestion) {
      setQuestions((prev) => {
        const newQuestions = [...prev];
        newQuestions[currentQuestionIndex] = editingQuestion;
        return newQuestions;
      });
    }

    setCurrentQuestionIndex(index);
    setEditingQuestion(questions[index]);
  };

  const handleSaveExam = async () => {
    setSaving(true);
    setError(null);

    try {
      // In a real app, this would be an actual Supabase update
      // For now, we'll simulate a delay and then redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate('/exams');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setSaving(false);
    }
  };

  const handlePreviewExam = () => {
    // In a real app, this would open a preview mode
    // For now, we'll just show an alert
    alert('Preview functionality would open here');
  };

  const handlePublishExam = async () => {
    setSaving(true);
    setError(null);

    try {
      // Call the API to publish the exam
      const response = await examsApi.publishExam(id!);

      if (response && response.data) {
        setShareableUrl(response.data.shareableUrl);
        setAccessCode(response.data.accessCode);
        setSuccess('Exam published successfully! You can now share the URL with students.');
      } else {
        throw new Error('Failed to publish exam');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareableUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={loading ? 'Loading Exam...' : `Edit: ${examTitle}`}
        description="Review and edit AI-generated questions"
        breadcrumbs={[
          { label: 'Exams', href: '/exams' },
          { label: 'Edit Exam' },
        ]}
        actions={
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviewExam}
              disabled={loading || saving}
            >
              Preview Exam
            </Button>
            <Button
              variant="outline"
              onClick={handlePublishExam}
              isLoading={saving}
              disabled={loading || !!shareableUrl}
            >
              {shareableUrl ? 'Published' : 'Publish Exam'}
            </Button>
            <Button
              onClick={handleSaveExam}
              isLoading={saving}
              disabled={loading}
            >
              Save Exam
            </Button>
          </div>
        }
      />

      {/* Shareable URL section */}
      {shareableUrl && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Exam Published Successfully</h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Share this URL with your students to allow them to take the exam.
                </p>
                <div className="mt-3 flex items-center rounded-md border border-green-300 bg-white p-2 dark:border-green-700 dark:bg-gray-800">
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none dark:text-gray-200"
                  />
                  <Button
                    size="sm"
                    onClick={handleCopyShareableUrl}
                    className="ml-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    Copy URL
                  </Button>
                </div>
                {accessCode && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Access Code: </span>
                    <span className="rounded-md bg-white px-2 py-1 text-sm font-mono text-green-800 dark:bg-gray-800 dark:text-green-200">
                      {accessCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SkeletonCard />
          </div>
          <div className="lg:col-span-2">
            <SkeletonCard header media lines={6} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Question List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button
                  size="sm"
                  onClick={handleAddQuestion}
                >
                  Add Question
                </Button>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`cursor-pointer rounded-md p-3 transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleNavigateQuestion(index)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Question {index + 1}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {question.text || 'Empty question'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingQuestion && (
                    <>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Question Type
                        </label>
                        <select
                          value={editingQuestion.type}
                          onChange={(e) => handleQuestionChange('type', e.target.value)}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Question Text
                        </label>
                        <textarea
                          value={editingQuestion.text}
                          onChange={(e) => handleQuestionChange('text', e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Enter your question here"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options
                        </label>

                        {editingQuestion.type === 'multiple-choice' ? (
                          // Multiple choice options
                          editingQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`option-${index}`}
                                name="correctAnswer"
                                checked={editingQuestion.correctAnswer === index}
                                onChange={() => handleCorrectAnswerChange(index)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                              />
                              <Input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))
                        ) : (
                          // True/False options
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="option-true"
                                name="correctAnswer"
                                checked={editingQuestion.correctAnswer === 0}
                                onChange={() => handleCorrectAnswerChange(0)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                              />
                              <label htmlFor="option-true" className="text-sm font-medium text-gray-700">
                                True
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="option-false"
                                name="correctAnswer"
                                checked={editingQuestion.correctAnswer === 1}
                                onChange={() => handleCorrectAnswerChange(1)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                              />
                              <label htmlFor="option-false" className="text-sm font-medium text-gray-700">
                                False
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-md bg-green-50 p-4"
                        >
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-green-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-md bg-red-50 p-4"
                        >
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
                              <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteQuestion}
                    disabled={questions.length <= 1}
                  >
                    Delete Question
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleNavigateQuestion(currentQuestionIndex - 1)}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleNavigateQuestion(currentQuestionIndex + 1)}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                    </Button>
                    <Button onClick={handleSaveQuestion}>
                      Save Question
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      )}

      <PageSection
        title="AI Assistance"
        description="Get help with your questions"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium">Improve Question</h3>
              <p className="text-sm text-gray-500">
                Ask the AI to improve the current question's clarity and quality.
              </p>
              <Button variant="outline" className="mt-4 w-full">
                Enhance Question
              </Button>
            </CardContent>
          </Card>

          <Card>
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium">Generate More Questions</h3>
              <p className="text-sm text-gray-500">
                Ask the AI to generate additional questions based on your materials.
              </p>
              <Button variant="outline" className="mt-4 w-full">
                Generate 5 More
              </Button>
            </CardContent>
          </Card>

          <Card>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium">Suggest Better Distractors</h3>
              <p className="text-sm text-gray-500">
                Get AI suggestions for more challenging or relevant wrong answer options.
              </p>
              <Button variant="outline" className="mt-4 w-full">
                Improve Options
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
