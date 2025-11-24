import { apiClient } from '@/lib/api';
import type { ToggleFavoriteResponse } from './types';

/**
 * Player API Service
 * Handles all player-related API calls to Express backend
 */
export const playerAPI = {
    /**
     * Toggle favorite status for an audio track
     * @param audioId - ID of the audio track
     * @returns Promise with updated favorite status
     */
    toggleFavorite: async (audioId: string): Promise<ToggleFavoriteResponse> => {

        // const response = await apiClient.post<ToggleFavoriteResponse>(
        //     `/api/audio/${audioId}/favorite`
        // );
        const response = {
            audioId,
            isFavorite: true
        }

        return response;
    }
};
