import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioStatus, Quiz } from "@/types/types";
import { RootState } from "@/store";

/**
 * Player Redux Slice
 * Following recommended pattern: State management ONLY, NO async logic
 * Async logic is handled in custom hooks (features/player/hooks/usePlayer.ts)
 */

export type { AudioStatus } from "@/types/types";

export interface AudioTrack {
  id: string | null | undefined;
  title: string;
  url: string;
  duration: number; // in seconds
  folderId: string;
  status: AudioStatus;
  folderName?: string; 
  script?: string;    
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
  playlist: AudioTrack[]; 
  currentIndex: number;   
    currentFolderId: string | null;
  isPlaying: boolean;
  progress: number;
  isExpanded: boolean;
  volume: number;
  error: string | null;
}

const initialState: PlayerState = {
  currentAudio: null,
  currentPlaylist: null,
  playlist: [],           // ✅ Empty array
  currentIndex: -1,       // ✅ -1 means no track selected
  isPlaying: false,
  progress: 0,
  isExpanded: false,
  volume: 50,
  error: null,
  currentFolderId: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlaylistByFolder(state, action: PayloadAction<{ tracks: AudioTrack[], folderId: string | null }>) {
      state.playlist = action.payload.tracks;
      state.currentFolderId = action.payload.folderId;
      state.currentIndex = -1; // Reset index
    },
    // ✅ Set playlist array (called from page.tsx when tracks load)
    setPlaylistArray(state, action: PayloadAction<AudioTrack[]>) {
      state.playlist = action.payload;
      state.currentFolderId = null;
      // Don't auto-play, just load the list
    },

    // Track management
    setTrack(state, action: PayloadAction<AudioTrack>) {
      state.isPlaying = true;
      state.currentAudio = action.payload;
      state.progress = 0;
      state.error = null;
      
      // ✅ Update currentIndex to match selected track
      const index = state.playlist.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.currentIndex = index;
      }
    },

    setPlaylist(state, action: PayloadAction<Playlist>) {
      state.currentPlaylist = action.payload;
    },

    // Playback controls
    playPause(state) {
      state.isPlaying = !state.isPlaying;
    },

    // ✅ Next track logic
    nextTrack(state) {
      if (state.playlist.length === 0) {
        console.warn('No playlist available');
        return;
      }
      
      // Move to next track, loop back to start if at end
      const nextIndex = (state.currentIndex + 1) % state.playlist.length;
      state.currentIndex = nextIndex;
      state.currentAudio = state.playlist[nextIndex];
      state.progress = 0;
      state.isPlaying = true; // Auto-play next track
      
      
    },

    // ✅ Previous track logic
    prevTrack(state) {
      if (state.playlist.length === 0) {
        console.warn('No playlist available');
        return;
      }
      
      // If progress > 3 seconds, restart current track
      if (state.progress > 3) {
        state.progress = 0;
        return;
      }
      
      // Otherwise, go to previous track
      const prevIndex = state.currentIndex === 0 
        ? state.playlist.length - 1  // Loop to last track
        : state.currentIndex - 1;
      
      state.currentIndex = prevIndex;
      state.currentAudio = state.playlist[prevIndex];
      state.progress = 0;
      state.isPlaying = true;
    },

    updateProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload >= 100 ? 0 : action.payload;
    },

    incrementProgress(state) {
      state.progress += 1;
    },

    // Favorite management - Sync actions only
    toggleFavoriteOptimistic(state) {
      if (state.currentAudio) {
        state.currentAudio.isFavorite = !state.currentAudio.isFavorite;
        
        // ✅ Also update in playlist array
        if (state.currentIndex >= 0 && state.playlist[state.currentIndex]) {
          state.playlist[state.currentIndex].isFavorite = state.currentAudio.isFavorite;
        }
      }
    },

    updateFavoriteStatus(state, action: PayloadAction<{ audioId: string; isFavorite: boolean }>) {
      if (state.currentAudio?.id === action.payload.audioId) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
      
      // ✅ Also update in playlist array
      const track = state.playlist.find(t => t.id === action.payload.audioId);
      if (track) {
        track.isFavorite = action.payload.isFavorite;
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
  setPlaylistArray, 
  setPlaylistByFolder,
  setTrack,
  setPlaylist,
  playPause,
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