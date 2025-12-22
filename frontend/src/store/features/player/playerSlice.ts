import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AudioStatus } from "@/types/types";
import { RootState } from "@/store";
import { toggleFavorite } from '@/store/features/audio/audioSlice';

export type { AudioStatus } from "@/types/types";

export interface AudioTrack {
  id: string | null | undefined;
  title: string;
  url: string;
  fileUrl?: string;
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
  duration: number;
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
  duration: 0,
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
      
      console.log('📋 [Redux] setPlaylistByFolder:', {
        count: action.payload.tracks.length,
        sampleUrl: action.payload.tracks[0]?.url
      });
    },

    setPlaylistArray(state, action: PayloadAction<AudioTrack[]>) {
      state.playlist = action.payload;
      state.currentFolderId = null;
      
      console.log('📋 [Redux] setPlaylistArray:', {
        count: action.payload.length,
        sampleUrl: action.payload[0]?.url
      });
    },

    setTrack(state, action: PayloadAction<AudioTrack>) {
      state.isPlaying = true;
      state.currentAudio = action.payload;
      state.progress = 0;
      state.duration = action.payload.duration || 0;
      state.error = null;
      
      const index = state.playlist.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.currentIndex = index;
      }
      
      console.log('🎵 [Redux] setTrack:', {
        id: action.payload.id,
        title: action.payload.title,
        url: action.payload.url,
        isPlaying: true
      });
    },
    
    setPlaylist(state, action: PayloadAction<Playlist>) {
      state.currentPlaylist = action.payload;
    },

    playPause(state) {
      state.isPlaying = !state.isPlaying;
      console.log('⏯️ [Redux] playPause:', state.isPlaying);
    },

    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
      console.log('▶️ [Redux] setIsPlaying:', action.payload);
    },
    
    nextTrack(state) {
      if (state.playlist.length === 0) return;
      
      const nextIndex = (state.currentIndex + 1) % state.playlist.length;
      state.currentIndex = nextIndex;
      state.currentAudio = state.playlist[nextIndex];
      state.progress = 0;
      state.duration = state.currentAudio?.duration || 0;
      state.isPlaying = true;
      
      console.log('⏭️ [Redux] nextTrack:', {
        nextIndex,
        id: state.currentAudio?.id,
        title: state.currentAudio?.title,
        url: state.currentAudio?.url
      });
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
      state.duration = state.currentAudio?.duration || 0;
      state.isPlaying = true;
      
      console.log('⏮️ [Redux] prevTrack:', {
        prevIndex,
        id: state.currentAudio?.id,
        title: state.currentAudio?.title,
        url: state.currentAudio?.url
      });
    },
    
    updateProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
      if (state.currentAudio) {
        state.currentAudio.duration = action.payload;
      }
    },
    
    incrementProgress(state) {
      state.progress += 1;
    },

    // ✅ QUAN TRỌNG: Dùng Immer để update in-place
    toggleFavoriteOptimistic(state) {
      if (state.currentAudio) {
        // ✅ Immer tự động detect mutation và update
        state.currentAudio.isFavorite = !state.currentAudio.isFavorite;
        
        // ✅ Cập nhật playlist
        if (state.currentIndex >= 0 && state.playlist[state.currentIndex]) {
          state.playlist[state.currentIndex].isFavorite = state.currentAudio.isFavorite;
        }
        
        console.log('❤️ [Redux] toggleFavoriteOptimistic:', {
          id: state.currentAudio.id,
          isFavorite: state.currentAudio.isFavorite
        });
      }
    },
    
    updateFavoriteStatus(state, action: PayloadAction<{ audioId: string; isFavorite: boolean }>) {
      // ✅ Update currentAudio in-place
      if (state.currentAudio && String(state.currentAudio.id) === String(action.payload.audioId)) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
      
      // ✅ Update playlist
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
      // ✅ Update in-place dùng Immer
      if (state.currentAudio && String(state.currentAudio.id) === String(action.payload.id)) {
        state.currentAudio.isFavorite = action.payload.isFavorite;
      }
      
      const track = state.playlist.find(t => String(t.id) === String(action.payload.id));
      if (track) {
        track.isFavorite = action.payload.isFavorite;
      }
      
      console.log('✅ [Redux] toggleFavorite.fulfilled:', {
        id: action.payload.id,
        isFavorite: action.payload.isFavorite
      });
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
  setDuration,
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