import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioStatus, AudioTrack } from "@/types/types";

/**
 * Player Redux Slice
 * Following recommended pattern: State management ONLY, NO async logic
 * Async logic is handled in custom hooks (features/player/hooks/usePlayer.ts)
 */

interface PlayerState {
  currentAudio: AudioTrack;
  isPlaying: boolean;
  progress: number; // 0 - 100
  isExpanded: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  currentAudio: {
    id: null,
    title: '',
    url: '',
    duration: 0,
    folderId: '',
    status: AudioStatus.NEW,
    isFavorite: false,
    playCount: 0,
    script: '',
    quizzes: []
  },
  isPlaying: false,
  progress: 0,
  isExpanded: false,
  error: null
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Track management
    setTrack(state, action: PayloadAction<AudioTrack>) {
      state.currentAudio = action.payload;
      state.progress = 0;
      state.error = null;
    },

    // Playback controls
    playPause(state) {
      state.isPlaying = !state.isPlaying;
    },

    nextTrack(state) {
      // TODO: xử lý logic next trong danh sách
    },

    prevTrack(state) {
      // TODO: xử lý logic prev trong danh sách
    },

    updateProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload >= 100 ? 0 : action.payload;
    },

    // Favorite management - Sync actions only
    /**
     * Optimistic update - Toggle favorite immediately for instant UI feedback
     * This will be called BEFORE the API call
     */
    toggleFavoriteOptimistic(state) {
      console.log('toggleFavoriteOptimistic');
      if (state.currentAudio) {
        state.currentAudio.isFavorite = !state.currentAudio.isFavorite;
      }
    },

    /**
     * Update favorite status from server response
     * This confirms the server state after API call
     */
    updateFavoriteStatus(state, action: PayloadAction<{ audioId: string; isFavorite: boolean }>) {
      if (state.currentAudio?.id === action.payload.audioId) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
    },

    // UI state
    setExpanded(state, action: PayloadAction<boolean>) {
      state.isExpanded = action.payload;
    },

    toggleExpanded(state) {
      state.isExpanded = !state.isExpanded;
    },

    // Error handling
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    }
  }
});

export const {
  setTrack,
  playPause,
  nextTrack,
  prevTrack,
  updateProgress,
  toggleFavoriteOptimistic,
  updateFavoriteStatus,
  setExpanded,
  toggleExpanded,
  setError,
  clearError
} = playerSlice.actions;

export default playerSlice.reducer;
