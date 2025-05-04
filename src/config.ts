/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      PASSWORD: '/user/password',
      NOTIFICATIONS: '/user/notifications',
      APPEARANCE: '/user/appearance',
    },
    CLASSES: {
      BASE: '/classes',
      STUDENTS: (classId: string) => `/classes/${classId}/students`,
      STUDENT: (classId: string, studentId: string) => `/classes/${classId}/students/${studentId}`,
    },
    EXAMS: {
      BASE: '/exams',
      DETAIL: (id: string) => `/exams/${id}`,
      GENERATE: (id: string) => `/exams/${id}/generate`,
      PUBLISH: (id: string) => `/exams/${id}/publish`,
    },
    STUDENTS: {
      BASE: '/students',
      DETAIL: (id: string) => `/students/${id}`,
      INVITE: '/students/invite',
      CREATE: '/students/create',
    },
    QUESTIONS: {
      BASE: '/questions',
      DETAIL: (id: string) => `/questions/${id}`,
      BULK: '/questions/bulk',
    },
    STORAGE: {
      CONFIRM: '/storage/confirm',
      DOCUMENTS: {
        BASE: '/storage/documents',
        PROCESS: '/storage/documents/process',
      },
    },
  },
}

/**
 * Supabase Configuration
 * Note: Direct Supabase access should be minimized and go through the API instead
 */
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  STORAGE: {
    BUCKETS: {
      DOCUMENTS: 'documents',
      AVATARS: 'avatars',
    },
  },
};
