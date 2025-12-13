// src/features/stats/api.ts
import { apiClient } from '@/lib/api';

export const statsApi = {
  getStats: async () => {
    return await apiClient.get('/stats');
  }
};