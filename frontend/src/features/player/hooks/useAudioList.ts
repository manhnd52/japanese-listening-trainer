import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { playerApi } from '../api';
import { AudioTrack } from '@/store/features/player/playerSlice';

/**
 * Custom hook to fetch audio list for current user
 * @returns {tracks, isLoading, error, refetch}
 */
export const useAudioList = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Lấy userId từ Redux auth state
  const userId = useAppSelector((state) => state.auth.user?.id);

  // ✅ useCallback để stable function reference
  const loadTracks = useCallback(async () => {
    // ✅ Nếu chưa login thì không fetch
    if (!userId) {
      setIsLoading(false);
      setError('User not logged in');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await playerApi.getAllAudios(userId);
      setTracks(data);
    } catch (err: unknown) {
      console.error('Failed to load audio tracks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio tracks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // ✅ Dependency: userId

  // ✅ Auto fetch khi component mount hoặc userId thay đổi
  useEffect(() => {
    loadTracks();
  }, [loadTracks]); // ✅ Dependency: loadTracks

  return {
    tracks,
    isLoading,
    error,
    refetch: loadTracks // ✅ Dùng loadTracks làm refetch
  };
};