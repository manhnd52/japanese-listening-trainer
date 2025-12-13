'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { LoginInput } from '../types';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/features/auth/authSlice';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useAppDispatch();

  const login = async (credentials: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Gọi API
      const response = await authApi.login(credentials);

      const { user, accessToken, refreshToken } = response.data;
      
      // 2. Lưu token vào LocalStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', accessToken); 
        localStorage.setItem('refreshToken', refreshToken);
      }

      // 3. Lưu vào Redux Store
      dispatch(setCredentials({ user, accessToken }));

      // 4. Chuyển hướng về trang chủ
      router.push('/');
      
      return response;
    } catch (err: any) {
      // Lấy message lỗi từ response backend trả về
      const message = err.response?.data?.error?.message || 'Đăng nhập thất bại';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};