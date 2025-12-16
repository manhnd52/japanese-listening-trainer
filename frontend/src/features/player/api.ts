import { apiClient } from '@/lib/api';
import { AudioTrack, AudioStatus } from '@/store/features/player/playerSlice';

// ✅ Define interface cho backend response
interface BackendAudioItem {
  id: string;
  title: string;
  url: string;
  duration: number;
  folderId: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
  isFavorite: boolean;
  folderName: string;
  script?: string;
  createdBy: number;
  listenCount: number;
  completionPercentage: number;
}

interface GetAudioResponse {
  success: boolean;
  data: BackendAudioItem[];
  message?: string;
}

// ✅ Base URL cho audio files
const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

export const playerApi = {
  async getAllAudios(userId: number): Promise<AudioTrack[]> {
    const response = await apiClient.get<GetAudioResponse>('/audios', {
      params: { userId }
    });

    return response.data.data.map((audio): AudioTrack => {
      
      const encodedUrl = audio.url
        .split('/')
        .map((segment, index) => {
          // Chỉ encode phần filename (phần cuối), giữ nguyên /audio/
          return index === audio.url.split('/').length - 1 
            ? encodeURIComponent(segment) 
            : segment;
        })
        .join('/');

      return {
        id: audio.id,
        title: audio.title,
        url: `${AUDIO_BASE_URL}${encodedUrl}`, 
        duration: audio.duration,
        folderId: audio.folderId,
        status: audio.status as AudioStatus,
        isFavorite: audio.isFavorite,
        folderName: audio.folderName,
        script: audio.script,
      };
    });
  }
};