import { supabase } from '@/lib/supabase/client';
import { API_CONFIG, SUPABASE_CONFIG } from '@/config';

/**
 * Base API service for making requests to the backend
 */
class ApiService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set the authorization header with the current session token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      console.warn('No authentication token available');
    }

    return {
      ...this.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      } catch (jsonError) {
        // If response is not JSON
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response.json();
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      } catch (jsonError) {
        // If response is not JSON
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response.json();
  }

  /**
   * Make a PATCH request to the API
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      } catch (jsonError) {
        // If response is not JSON
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response.json();
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
      } catch (jsonError) {
        // If response is not JSON
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return response.json();
  }

  /**
   * Upload a file to Supabase storage and confirm with API
   */
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    // First upload to Supabase storage directly
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    // Then confirm the upload with the API
    const result = await this.post<{ url: string }>(API_CONFIG.ENDPOINTS.STORAGE.CONFIRM, {
      bucket,
      path: data.path,
      fileType: file.type,
      fileSize: file.size,
    });

    return result.url;
  }
}

export const apiService = new ApiService();

/**
 * Authentication service
 */
export const authApi = {
  /**
   * Login with email and password (for teachers)
   */
  login: async (email: string, password: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
  },

  /**
   * Get current user information
   */
  getCurrentUser: async () => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.AUTH.ME);
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Register a new user
   */
  register: async (email: string, password: string, name: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      email,
      password,
      name,
    });
  },

  /**
   * Refresh the access token
   */
  refreshToken: async (refreshToken: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });
  },

  /**
   * Send a password reset email
   */
  forgotPassword: async (email: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (password: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      password,
    });
  },
};

/**
 * Classes service
 */
export const classesApi = {
  /**
   * Get all classes
   */
  getClasses: async () => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.CLASSES.BASE);
  },

  /**
   * Get a class by ID
   */
  getClass: async (id: string) => {
    return apiService.get<any>(`${API_CONFIG.ENDPOINTS.CLASSES.BASE}/${id}`);
  },

  /**
   * Create a new class
   */
  createClass: async (data: {
    name: string;
    description?: string;
    subject?: string;
    grade_level?: string;
  }) => {
    console.log('Creating class with data:', data);
    return apiService.post<any>(API_CONFIG.ENDPOINTS.CLASSES.BASE, data);
  },

  /**
   * Update a class
   */
  updateClass: async (id: string, data: { name?: string; description?: string }) => {
    return apiService.patch<any>(`${API_CONFIG.ENDPOINTS.CLASSES.BASE}/${id}`, data);
  },

  /**
   * Delete a class
   */
  deleteClass: async (id: string) => {
    return apiService.delete<any>(`${API_CONFIG.ENDPOINTS.CLASSES.BASE}/${id}`);
  },

  /**
   * Add students to a class
   */
  addStudents: async (classId: string, studentIds: string[]) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.CLASSES.STUDENTS(classId), {
      student_ids: studentIds,
    });
  },

  /**
   * Remove a student from a class
   */
  removeStudent: async (classId: string, studentId: string) => {
    return apiService.delete<any>(API_CONFIG.ENDPOINTS.CLASSES.STUDENT(classId, studentId));
  },

  /**
   * Get materials for a class
   */
  getClassMaterials: async (classId: string) => {
    return apiService.get<any>(`${API_CONFIG.ENDPOINTS.CLASSES.BASE}/${classId}/materials`);
  },
};

/**
 * Exams service
 */
export const examsApi = {
  /**
   * Get all exams
   */
  getExams: async (classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.EXAMS.BASE, { class_id: classId });
  },

  /**
   * Get an exam by ID
   */
  getExam: async (id: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.EXAMS.DETAIL(id));
  },

  /**
   * Create a new exam
   */
  createExam: async (data: {
    title: string;
    description?: string;
    class_id: string;
    question_count?: number;
    question_type?: string;
    time_limit?: number;
    deadline?: string;
    shuffle_questions?: boolean;
    shuffle_answers?: boolean;
    strict_timing?: boolean;
    material_ids?: string[];
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.EXAMS.BASE, data);
  },

  /**
   * Update an exam
   */
  updateExam: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      scheduled_date?: string;
      duration?: number;
    }
  ) => {
    return apiService.patch<any>(API_CONFIG.ENDPOINTS.EXAMS.DETAIL(id), data);
  },

  /**
   * Delete an exam
   */
  deleteExam: async (id: string) => {
    return apiService.delete<any>(API_CONFIG.ENDPOINTS.EXAMS.DETAIL(id));
  },

  /**
   * Generate questions for an exam
   */
  generateQuestions: async (
    examId: string,
    data: {
      document_id?: string;
      num_questions: number;
      question_types?: string[];
    }
  ) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.EXAMS.GENERATE(examId), data);
  },

  /**
   * Publish an exam
   */
  publishExam: async (id: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.EXAMS.PUBLISH(id));
  },

  /**
   * Get an exam by access code (for students, no auth required)
   */
  getExamByCode: async (id: string, code: string) => {
    return apiService.get<any>(`${API_CONFIG.ENDPOINTS.EXAMS.BASE}/${id}/access?code=${code}`);
  },

  /**
   * Submit exam answers (for students, no auth required)
   */
  submitExam: async (id: string, data: {
    code: string;
    student_name: string;
    student_id: string;
    answers: Array<{
      question_id: string;
      answer: string;
    }>;
  }) => {
    return apiService.post<any>(`${API_CONFIG.ENDPOINTS.EXAMS.BASE}/${id}/submit`, data);
  },
};

/**
 * Students service
 */
export const studentsApi = {
  /**
   * Get all students
   */
  getStudents: async (classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.STUDENTS.BASE, { class_id: classId });
  },

  /**
   * Get a student by ID
   */
  getStudent: async (id: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.STUDENTS.DETAIL(id));
  },

  /**
   * Invite students
   */
  inviteStudents: async (data: { emails: string[]; class_id?: string }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.STUDENTS.INVITE, data);
  },

  /**
   * Create student accounts
   */
  createStudents: async (data: {
    students: Array<{
      name: string;
      matric_number: string;
      email?: string;
    }>;
    class_id?: string;
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);
  },
};

/**
 * Questions service
 */
export const questionsApi = {
  /**
   * Get questions for an exam
   */
  getQuestions: async (examId: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.QUESTIONS.BASE, { exam_id: examId });
  },

  /**
   * Get a question by ID
   */
  getQuestion: async (id: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.QUESTIONS.DETAIL(id));
  },

  /**
   * Create a new question
   */
  createQuestion: async (data: {
    exam_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    options?: string[];
    correct_answer?: string | number;
    points?: number;
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.QUESTIONS.BASE, data);
  },

  /**
   * Update a question
   */
  updateQuestion: async (
    id: string,
    data: {
      question_text?: string;
      question_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
      options?: string[];
      correct_answer?: string | number;
      points?: number;
    }
  ) => {
    return apiService.patch<any>(API_CONFIG.ENDPOINTS.QUESTIONS.DETAIL(id), data);
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (id: string) => {
    return apiService.delete<any>(API_CONFIG.ENDPOINTS.QUESTIONS.DETAIL(id));
  },

  /**
   * Create multiple questions at once
   */
  createBulkQuestions: async (data: {
    exam_id: string;
    questions: Array<{
      question_text: string;
      question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
      options?: string[];
      correct_answer?: string | number;
      points?: number;
    }>;
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.QUESTIONS.BULK, data);
  },
};

/**
 * Analytics service
 */
export const analyticsApi = {
  /**
   * Get overview analytics data
   */
  getOverview: async (timeRange?: string, classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW, {
      time_range: timeRange,
      class_id: classId,
    });
  },

  /**
   * Get performance analytics data
   */
  getPerformance: async (classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.PERFORMANCE, {
      class_id: classId,
    });
  },
};

/**
 * Dashboard service
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
  },

  /**
   * Get recent classes and exams
   */
  getRecent: async () => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.RECENT);
  },
};

/**
 * Materials service
 */
export const materialsApi = {
  /**
   * Get all materials
   */
  getMaterials: async (classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.MATERIALS.BASE, { class_id: classId });
  },

  /**
   * Get a material by ID
   */
  getMaterial: async (id: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.MATERIALS.DETAIL(id));
  },

  /**
   * Upload a material
   */
  uploadMaterial: async (file: File, title: string, description: string, classId: string) => {
    const path = `${SUPABASE_CONFIG.STORAGE.BUCKETS.MATERIALS}/${Date.now()}_${file.name}`;
    const url = await apiService.uploadFile(SUPABASE_CONFIG.STORAGE.BUCKETS.MATERIALS, path, file);

    return apiService.post<any>(API_CONFIG.ENDPOINTS.MATERIALS.BASE, {
      title,
      description,
      class_id: classId,
      file_url: url,
      file_type: file.type,
      file_size: file.size,
    });
  },

  /**
   * Process a material for AI question generation
   */
  processMaterial: async (materialId: string) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.MATERIALS.PROCESS, {
      material_id: materialId,
    });
  },

  /**
   * Delete a material
   */
  deleteMaterial: async (id: string) => {
    return apiService.delete<any>(API_CONFIG.ENDPOINTS.MATERIALS.DETAIL(id));
  },
};

/**
 * Submissions service
 */
export const submissionsApi = {
  /**
   * Get all submissions for an exam
   */
  getSubmissions: async (examId: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.SUBMISSIONS.BASE, { exam_id: examId });
  },

  /**
   * Get a submission by ID
   */
  getSubmission: async (id: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.SUBMISSIONS.DETAIL(id));
  },

  /**
   * Submit an exam (for students)
   */
  submitExam: async (data: {
    exam_id: string;
    access_code: string;
    student_name: string;
    matric_number: string;
    answers: Array<{
      question_id: string;
      answer: string | number;
    }>;
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.SUBMISSIONS.SUBMIT, data);
  },
};

/**
 * Storage service
 */
export const storageApi = {
  /**
   * Upload a document and process it
   */
  uploadDocument: async (file: File, classId?: string) => {
    const path = `${SUPABASE_CONFIG.STORAGE.BUCKETS.DOCUMENTS}/${Date.now()}_${file.name}`;
    const url = await apiService.uploadFile(SUPABASE_CONFIG.STORAGE.BUCKETS.DOCUMENTS, path, file);

    // Process the document with the API
    return apiService.post<any>(API_CONFIG.ENDPOINTS.STORAGE.DOCUMENTS.PROCESS, {
      url,
      filename: file.name,
      class_id: classId,
    });
  },

  /**
   * Get document by ID
   */
  getDocument: async (id: string) => {
    return apiService.get<any>(`${API_CONFIG.ENDPOINTS.STORAGE.DOCUMENTS.BASE}/${id}`);
  },

  /**
   * Get all documents
   */
  getDocuments: async (classId?: string) => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.STORAGE.DOCUMENTS.BASE, { class_id: classId });
  },
};
