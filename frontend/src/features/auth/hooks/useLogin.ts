'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { LoginInput } from '../types';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/features/auth/authSlice';
import { fetchFolders, fetchAudios } from '@/store/features/audio/audioSlice';

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
      
      const userId = parseInt(response.data.user.id);
      const userObject = {
        id: userId,
        email: response.data.user.email,
        fullname: response.data.user.name,
        avatarUrl: '',
      };

      // 2. Lưu vào LocalStorage
      if (typeof window !== 'undefined') {

        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(userObject)); // ✅ Lưu user object
        
        // Also save to cookies for middleware
        document.cookie = `accessToken=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }

      // 3. Lưu vào Redux Store
      dispatch(setCredentials({
        user: userObject,
        accessToken: response.data.token
      }));

      console.log('✅ Login successful - User:', userObject);

      // 4. Chuyển hướng về trang chủ
      router.push('/');
      
      return response;
    } catch (err: any) {
      // Lấy message lỗi từ response backend trả về
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};