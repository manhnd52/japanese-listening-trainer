import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioStatus } from "@/types/types";
import { RootState } from "@/store";
import { toggleFavorite } from '@/store/features/audio/audioSlice';

export type { AudioStatus } from "@/types/types";

export interface AudioTrack {
  id: string | null | undefined;
  title: string;
  url: string;
  duration: number;
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

export enum Source {
  MyList = "My List",
  Community = "Community"
}

interface RelaxModeConfig {
  source: Source;
  enableQuiz: boolean;
  aiExplainMode: boolean;
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
  relaxModeConfig: RelaxModeConfig;
}

const initialState: PlayerState = {
  currentAudio: null,
  currentPlaylist: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  isExpanded: false,
  volume: 50,
  currentFolderId: null,
  error: null,
  relaxModeConfig: {
    source: Source.MyList,
    enableQuiz: true,
    aiExplainMode: false
  }
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlaylistByFolder(state, action: PayloadAction<{ tracks: AudioTrack[], folderId: string | null }>) {
      state.playlist = action.payload.tracks;
      state.currentFolderId = action.payload.folderId;
      state.currentIndex = -1;
    },

    setPlaylistArray(state, action: PayloadAction<AudioTrack[]>) {
      state.playlist = action.payload;
      state.currentFolderId = null;
    },

    setTrack(state, action: PayloadAction<AudioTrack>) {
      state.isPlaying = true;
      state.currentAudio = action.payload;
      state.progress = 0;
      state.error = null;
      const index = state.playlist.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.currentIndex = index;
      }
    },
    setPlaylist(state, action: PayloadAction<Playlist>) {
      state.currentPlaylist = action.payload;
    },

    playPause(state) {
      state.isPlaying = !state.isPlaying;
    },

    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    
    nextTrack(state) {
      if (state.playlist.length === 0) return;
      const nextIndex = (state.currentIndex + 1) % state.playlist.length;
      state.currentIndex = nextIndex;
      state.currentAudio = state.playlist[nextIndex];
      state.progress = 0;
      state.isPlaying = true;
    },

    prevTrack(state) {
      if (state.playlist.length === 0) return;
      if (state.progress > 3) {
        state.progress = 0;
        return;
      }
      const prevIndex = state.currentIndex === 0
        ? state.playlist.length - 1
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

    toggleFavoriteOptimistic(state) {
      if (state.currentAudio) {
        state.currentAudio.isFavorite = !state.currentAudio.isFavorite;
        if (state.currentIndex >= 0 && state.playlist[state.currentIndex]) {
          state.playlist[state.currentIndex].isFavorite = state.currentAudio.isFavorite;
        }
      }
    },
    
    updateFavoriteStatus(state, action: PayloadAction<{ audioId: string; isFavorite: boolean }>) {
      if (state.currentAudio?.id === action.payload.audioId) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
      const track = state.playlist.find(t => t.id === action.payload.audioId);
      if (track) {
        track.isFavorite = action.payload.isFavorite;
      }
    },

    setExpanded(state, action: PayloadAction<boolean>) {
      state.isExpanded = action.payload;
    },
    toggleExpanded(state) {
      state.isExpanded = !state.isExpanded;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },
    
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },

    setRelaxModeSource(state, action: PayloadAction<Source>) {
      state.relaxModeConfig.source = action.payload;
    },
    
    toggleEnableQuiz(state) {
      state.relaxModeConfig.enableQuiz = !state.relaxModeConfig.enableQuiz;
    },
    toggleAiExplainMode(state) {
      state.relaxModeConfig.aiExplainMode = !state.relaxModeConfig.aiExplainMode;
    },
    
    updateRelaxModeConfig(state, action: PayloadAction<Partial<RelaxModeConfig>>) {
      state.relaxModeConfig = { ...state.relaxModeConfig, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      // Nếu currentAudio là audio vừa favorite, cập nhật luôn
      if (state.currentAudio && state.currentAudio.id === action.payload.id) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
      // Đồng bộ luôn trong playlist nếu có
      const track = state.playlist.find(t => t.id === action.payload.id);
      if (track) {
        track.isFavorite = action.payload.isFavorite;
      }
    });
  }
});

export const {
  setPlaylistArray,
  setPlaylistByFolder,
  setTrack,
  setPlaylist,
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
  clearError,
  setRelaxModeSource,
  toggleEnableQuiz,
  toggleAiExplainMode,
  updateRelaxModeConfig
} = playerSlice.actions;

export const playerSelector = (state: RootState) => state.player;

export default playerSlice.reducer;