import { apiClient } from '@/lib/api'; 
import { LoginInput, RegisterInput, AuthResponse, UpdateProfileInput, UpdateProfileResponse} from './types';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>('/auth/profile', data);
    return response.data;
  }
};