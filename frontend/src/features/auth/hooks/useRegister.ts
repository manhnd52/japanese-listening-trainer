'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { RegisterInput } from '../types';

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register(data);
      router.push('/login?registered=true');
      
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Đăng ký thất bại';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};