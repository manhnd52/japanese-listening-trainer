import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useEffect } from 'react';
import { fetchAudios, fetchFolders } from '@/store/features/audio/audioSlice';

export const useAudioList = () => {
  const dispatch = useAppDispatch();
  const { audios, folders, loading, error } = useAppSelector((state) => state.audio);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAudios({ userId: user.id }));
      dispatch(fetchFolders(user.id));
    }
  }, [dispatch, user?.id]);

  return {
    audios,
    folders,
    loading,
    error,
    userId: user?.id,
  };
};