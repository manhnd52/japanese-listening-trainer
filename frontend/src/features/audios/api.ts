import { apiClient } from '@/lib/api'; 
import { FetchAudiosParams,UploadAudioParams,UpdateAudioParams,MoveAudioParams,DeleteAudioParams,ToggleFavoriteParams } from './types';
export const audioApi = {
  // Fetch all audios
  fetchAudios: async ({ userId }: FetchAudiosParams) => {
    const response = await apiClient.get(`/audios?userId=${userId}`);
    return response.data;
  },

  // Fetch folders
  fetchFolders: async (userId: number) => {
    const response = await apiClient.get(`/audios/folders?userId=${userId}`);
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async ({ id, userId, isFavorite }: ToggleFavoriteParams) => {
    const response = await apiClient.patch(`/audios/${id}/favorite`, {
      userId,
      isFavorite,
    });
    return response.data;
  },

  // Delete audio
  deleteAudio: async ({ id, userId }: DeleteAudioParams) => {
    const response = await apiClient.delete(`/audios/${id}?userId=${userId}`);
    return response.data;
  },

  // Move audio to folder
  moveAudio: async ({ id, folderId, userId }: MoveAudioParams) => {
    const response = await apiClient.patch(`/audios/${id}/move`, {
      folderId: Number(folderId),
      userId,
    });
    return response.data;
  },

  // Update audio
  updateAudio: async ({ id, title, script, folderId, userId }: UpdateAudioParams) => {
    const response = await apiClient.put(`/audios/${id}`, {
      title,
      script,
      folderId,
      userId,
    });
    return response.data;
  },

  // Upload audio
  uploadAudio: async ({ formData, userId }: UploadAudioParams) => {
    formData.append('userId', userId.toString());
    const response = await apiClient.post('/audios', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};