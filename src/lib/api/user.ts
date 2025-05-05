import { apiService } from './index';
import { API_CONFIG } from '@/config';

/**
 * User service for managing user data
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiService.get<any>(API_CONFIG.ENDPOINTS.USER.PROFILE);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    name?: string;
    institution?: string;
    department?: string;
  }) => {
    return apiService.patch<any>(API_CONFIG.ENDPOINTS.USER.PROFILE, data);
  },

  /**
   * Update user password
   */
  updatePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    return apiService.post<any>(API_CONFIG.ENDPOINTS.USER.PASSWORD, data);
  },

  /**
   * Update user notification settings
   */
  updateNotificationSettings: async (data: {
    email_notifications?: boolean;
    exam_submissions?: boolean;
    new_students?: boolean;
    system_updates?: boolean;
  }) => {
    return apiService.patch<any>(API_CONFIG.ENDPOINTS.USER.NOTIFICATIONS, data);
  },

  /**
   * Update user appearance settings
   */
  updateAppearanceSettings: async (data: {
    theme?: string;
    font_size?: string;
    high_contrast?: boolean;
  }) => {
    return apiService.patch<any>(API_CONFIG.ENDPOINTS.USER.APPEARANCE, data);
  },
};
