import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioStatus, Quiz } from "@/types/types";
import { RootState } from "@/store";

/**
 * Player Redux Slice
 * Following recommended pattern: State management ONLY, NO async logic
 * Async logic is handled in custom hooks (features/player/hooks/usePlayer.ts)
 */
export interface AudioTrack {
  id: string | null | undefined;
  title: string;
  url: string; // Mock URL or base64
  duration: number; // in seconds
  folderId: string;
  status: AudioStatus;
  isFavorite: boolean;
  lastPlayed?: Date;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  audioTracks: AudioTrack[];
}

interface PlayerState {
  currentAudio: AudioTrack | null;
  currentPlaylist: Playlist | null;
  isPlaying: boolean;
  progress: number;
  isExpanded: boolean;
  volume: number;
  error: string | null;
}

const initialState: PlayerState = {
  currentAudio: null,
  currentPlaylist: null,
  isPlaying: false,
  progress: 0,
  isExpanded: false,
  volume: 50,
  error: null
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Track management
    setTrack(state, action: PayloadAction<AudioTrack>) {
      state.isPlaying = true;
      state.currentAudio = action.payload;
      state.progress = 0;
      state.error = null;
    },

    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },

    setPlaylist(state, action: PayloadAction<Playlist>) {
      state.currentPlaylist = action.payload;
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

    incrementProgress(state) {
      state.progress += 1;
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
    },

    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    }
  }
});

export const {
  setTrack,
  playPause,
  setIsPlaying,
  nextTrack,
  prevTrack,
  updateProgress,
  incrementProgress,
  toggleFavoriteOptimistic,
  updateFavoriteStatus,
  setExpanded,
  toggleExpanded,
  setError,
  setVolume,
  clearError
} = playerSlice.actions;

export const playerSelector = (state: RootState) => state.player;

export default playerSlice.reducer;
