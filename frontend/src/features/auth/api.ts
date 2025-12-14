import { apiClient } from '@/lib/api'; 
import { LoginInput, RegisterInput, AuthResponse } from './types';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data; // ✅ Extract .data từ axios response
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data; // ✅ Extract .data từ axios response
  },
};

export const updateStreak = async () => {
  const response = await apiClient.post('/users/streak');
  return response.data;
};