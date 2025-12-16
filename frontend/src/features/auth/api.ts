import { apiClient } from '@/lib/api'; 
import { LoginInput, RegisterInput, AuthResponse, UpdateProfileInput, UpdateProfileResponse} from './types';

export interface UserStatsResponse {
  success: boolean;
  data: {
    streak: number;
    level: number;
    exp: number;
    lastActiveDate?: string;
  }
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data; 
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data; 
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>('/auth/profile', data);
    return response.data;
  },
  getUserStats: async (): Promise<UserStatsResponse> => {
    // Gọi đúng đường dẫn bạn đã khai báo ở backend (ví dụ: /stats hoặc /users/stats)
    const response = await apiClient.get<UserStatsResponse>('/stats'); 
    return response.data;
  }
};