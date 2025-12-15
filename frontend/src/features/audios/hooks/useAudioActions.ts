import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteAudio, moveAudio, toggleFavorite, fetchAudios } from '@/store/features/audio/audioSlice';
import { setTrack, AudioTrack as PlayerAudioTrack, AudioStatus } from '@/store/features/player/playerSlice';
import { AudioTrack } from '@/types/types';
import { message } from "antd";
export const useAudioActions = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handlePlay = (audio: AudioTrack) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    let url = (audio as { url?: string; fileUrl?: string }).url || (audio as { url?: string; fileUrl?: string }).fileUrl || '';
    if (url && !url.startsWith('http')) {
      url = backendUrl + url;
    }

    const playerAudio: PlayerAudioTrack = {
      id: audio.id,
      title: audio.title,
      url,
      duration: audio.duration,
      folderId: audio.folderId,
      status: (audio.status ?? 'NEW') as AudioStatus,
      isFavorite: audio.isFavorite ?? false,
      // folderName: audio.folderName ?? '', // Removed because AudioTrack does not have folderName
      script: audio.script ?? '',
    };
    dispatch(setTrack(playerAudio));
  };

  const handleToggleFavorite = async (audio: AudioTrack) => {
    if (user?.id) {
      await dispatch(toggleFavorite({ id: audio.id, userId: user.id, isFavorite: !audio.isFavorite }));
    }
  };

  const handleDelete = async (id: string) => {
    if (user?.id) {
      if (window.confirm('Are you sure you want to delete this audio?')) {
        const result = await dispatch(deleteAudio({ id, userId: user.id }));
        if (deleteAudio.fulfilled.match(result)) {
          alert('Audio deleted successfully!');
          dispatch(fetchAudios({ userId: user.id }));
        } else {
          alert('Failed to delete audio');
        }
      }
    }
  };

  const handleMove = async (id: string, folderId: string) => {
    if (!user?.id) {
      message.error('User not authenticated');
      return;
    }

    const result = await dispatch(moveAudio({ id, folderId, userId: user.id }));
    if (moveAudio.fulfilled.match(result)) {
      message.success('Audio moved successfully!');
      dispatch(fetchAudios({ userId: user.id }));
    } else {
      message.error('Failed to move audio');
    }
  };

  return {
    handlePlay,
    handleToggleFavorite,
    handleDelete,
    handleMove,
  };
};