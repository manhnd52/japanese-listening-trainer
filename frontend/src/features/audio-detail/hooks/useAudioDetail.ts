import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { AudioTrack } from '@/types/types';

/**
 * Hook to fetch audio detail by ID
 * Handles loading, error states and data fetching
 */
export function useAudioDetail(audioId: string) {
  const [audio, setAudio] = useState<AudioTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/audios/${audioId}`);
        const audioData = response.data.data;
        setAudio(audioData);
        if (!audioData) {
          setError('Audio not found');
        } else {
          setError(null);
        }
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setAudio(null);
        setError(error.response?.data?.message || 'Failed to load audio details');
        console.error('Error fetching audio detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (audioId) {
      fetchAudioDetail();
    }
  }, [audioId]);

  const refetch = async () => {
    if (!audioId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/audios/${audioId}`);
      const audioData = response.data.data;
      setAudio(audioData);
      if (!audioData) {
        setError('Audio not found');
      } else {
        setError(null);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setAudio(null);
      setError(error.response?.data?.message || 'Failed to load audio details');
    } finally {
      setLoading(false);
    }
  };

  return { audio, loading, error, refetch };
}
