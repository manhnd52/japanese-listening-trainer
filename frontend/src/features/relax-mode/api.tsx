import { apiClient } from '@/lib/api';

/**
 * Fetch random audios from user's own folders for Relax mode
 */
export async function fetchRandomAudiosFromMyList(userId: number, limit: number = 10) {
  const response = await apiClient.get(`/audios/random/my-list`, {
    params: { userId, limit }
  });
  return response.data.data;
}

/**
 * Fetch random audios from all public folders for Relax mode
 */
export async function fetchRandomAudiosFromCommunity(userId: number, limit: number = 10) {
  const response = await apiClient.get(`/audios/random/community`, {
    params: { userId, limit }
  });
  return response.data.data;
}
