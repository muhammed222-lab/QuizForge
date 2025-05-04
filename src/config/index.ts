/**
 * Application Configuration
 * 
 * This file contains all the configuration settings for the frontend application.
 * It centralizes environment variables and other configuration settings.
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      REFRESH: '/api/auth/refresh',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    CLASSES: {
      BASE: '/api/classes',
      STUDENTS: (classId: string) => `/api/classes/${classId}/students`,
      STUDENT: (classId: string, studentId: string) => `/api/classes/${classId}/students/${studentId}`,
    },
    EXAMS: {
      BASE: '/api/exams',
      DETAIL: (examId: string) => `/api/exams/${examId}`,
      GENERATE: (examId: string) => `/api/exams/${examId}/generate`,
      PUBLISH: (examId: string) => `/api/exams/${examId}/publish`,
    },
    STUDENTS: {
      BASE: '/api/students',
      DETAIL: (studentId: string) => `/api/students/${studentId}`,
      INVITE: '/api/students/invite',
      CREATE: '/api/students/create',
    },
    QUESTIONS: {
      BASE: '/api/questions',
      DETAIL: (questionId: string) => `/api/questions/${questionId}`,
      BULK: '/api/questions/bulk',
    },
    STORAGE: {
      CONFIRM: '/api/storage/confirm',
      DOCUMENTS: {
        PROCESS: '/api/documents/process',
        BASE: '/api/documents',
      },
    },
  },
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL || '',
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  STORAGE: {
    BUCKETS: {
      DOCUMENTS: 'documents',
      AVATARS: 'avatars',
    },
  },
};

// Authentication Configuration
export const AUTH_CONFIG = {
  STORAGE_KEY: 'quizforge_auth',
  TOKEN_REFRESH_INTERVAL: 1000 * 60 * 10, // 10 minutes
};

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    STORAGE_KEY: 'quizforge_theme',
    DEFAULT: 'light' as const,
  },
  ANIMATION: {
    PAGE_TRANSITION_DURATION: 0.3,
    ELEMENT_TRANSITION_DURATION: 0.2,
  },
  TOAST: {
    DURATION: 5000, // 5 seconds
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_QUESTION_GENERATION: true,
  ENABLE_DOCUMENT_PROCESSING: true,
  ENABLE_STUDENT_SELF_REGISTRATION: false,
  ENABLE_ANALYTICS: true,
};

// Date Format Configuration
export const DATE_FORMAT = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: 'yyyy-MM-dd\'T\'HH:mm:ss',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBER: false,
    REQUIRE_SPECIAL: false,
  },
  MATRIC_NUMBER: {
    DEFAULT_FORMAT: 'XX-XX-XXXX',
    ALLOW_CUSTOM_FORMAT: true,
  },
};

// Export default config object
export default {
  API: API_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  AUTH: AUTH_CONFIG,
  UI: UI_CONFIG,
  FEATURE_FLAGS,
  DATE_FORMAT,
  VALIDATION,
};
