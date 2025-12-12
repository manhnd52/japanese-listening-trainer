import { apiClient } from '@/lib/api'; 
import { LoginInput, RegisterInput, AuthResponse } from './types';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    return await apiClient.post('/auth/login', data);
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return await apiClient.post('/auth/register', data);
  },
};