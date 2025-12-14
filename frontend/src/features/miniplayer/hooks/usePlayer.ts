'use client';

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import {
    toggleFavoriteOptimistic,
    updateFavoriteStatus,
    setError
} from '@/store/features/player/playerSlice';
import { playerAPI } from '../api';

/**
 * Custom hook for player functionality
 * Handles logic and state management for player features
 */
export const usePlayer = () => {
    const dispatch = useAppDispatch();

    /**
     * Select Redux State
     */
    const { currentAudio, isPlaying, progress, isExpanded } = useAppSelector(
        state => state.player
    );


    const toggleFavorite = useCallback(async () => {
        dispatch(toggleFavoriteOptimistic());

        try {
            if (currentAudio?.id) {
                const response = await playerAPI.toggleFavorite(currentAudio.id);

                dispatch(updateFavoriteStatus({
                    audioId: response.audioId,
                    isFavorite: response.isFavorite
                }));

                console.log('✅ Toggle favorite success:', response);
                return { success: true, data: response };
            }

        } catch (err) {
            console.error('❌ Toggle favorite error' + err);
        }
    }, [dispatch, currentAudio]);

    const isFavorite = useCallback((): boolean => {
        return currentAudio?.isFavorite ?? false;
    }, [currentAudio]);

    return {
        currentAudio,
        isPlaying,
        progress,
        isExpanded,
        isFavorite,
        toggleFavorite
    };
};
