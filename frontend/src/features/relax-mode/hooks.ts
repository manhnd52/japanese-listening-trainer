import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setPlaylistArray, setTrack, Source } from '@/store/features/player/playerSlice';
import { fetchRandomAudiosFromMyList, fetchRandomAudiosFromCommunity } from './api';

export const useRelaxMode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const loadRandomAudios = async (option: Source, onSuccess?: () => void, onError?: () => void) => {
    if (!user?.id) {
      console.error('User ID not found');
      return;
    }

    setIsLoading(true);
    
    try {
      const audios = option === Source.MyList
        ? await fetchRandomAudiosFromMyList(user.id, 20)
        : await fetchRandomAudiosFromCommunity(user.id, 20);
      
      if (audios.length > 0) {
        // Load playlist
        dispatch(setPlaylistArray(audios));
        // Start playing first track
        dispatch(setTrack(audios[0]));
        
        onSuccess?.();
      } else {
        alert('No audios found. Please try another option.');
        onError?.();
      }
    } catch (error) {
      console.error('Failed to fetch random audios:', error);
      alert('Failed to load audios. Please try again.');
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadRandomAudios
  };
};
