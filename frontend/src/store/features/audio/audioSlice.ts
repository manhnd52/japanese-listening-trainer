import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AudioTrack, Folder, AudioStatus } from '@/types/types';
import { audioApi } from '@/features/audios/api';
import { AxiosError } from 'axios';

interface FolderWithCount extends Folder {
  _count?: {
    audios: number;
  };
}

interface AudioState {
  audios: AudioTrack[];
  folders: FolderWithCount[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  currentAudio: AudioTrack | null;
}

const initialState: AudioState = {
  audios: [],
  folders: [],
  loading: false,
  error: null,
  uploadProgress: 0,
  currentAudio: null,
};

// Async thunks
export const fetchAudios = createAsyncThunk(
  'audio/fetchAudios',
  async ({ userId }: { userId: number }, { rejectWithValue }) => {
    try {
      const data = await audioApi.fetchAudios({ userId });
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch audios');
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

export const fetchFolders = createAsyncThunk(
  'audio/fetchFolders',
  async (userId: number, { rejectWithValue }) => {
    try {
      const data = await audioApi.fetchFolders(userId);
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch folders');
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

// SỬA ĐOẠN NÀY: Cho phép truyền callback onProgress vào thunk
export const uploadAudio = createAsyncThunk(
  'audio/uploadAudio',
  async (
    { formData, userId, onProgress }: { formData: FormData; userId: number; onProgress?: (percent: number) => void },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const data = await audioApi.uploadAudio({
        formData,
        userId,
        onProgress: (percent: number) => {
          dispatch(setUploadProgress(percent));
          if (onProgress) onProgress(percent);
        }
      });
      dispatch(setUploadProgress(0)); // Reset khi xong
      if (!data.success) {
        return rejectWithValue(data.message || 'Upload failed');
      }
      return data.data;
    } catch (error) {
      dispatch(setUploadProgress(0)); // Reset khi lỗi
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

export const updateAudio = createAsyncThunk(
  'audio/updateAudio',
  async ({
    id,
    data,
    userId
  }: {
    id: string;
    data: { title?: string; script?: string; folderId?: string };
    userId: number
  }, { rejectWithValue }) => {
    try {
      const result = await audioApi.updateAudio({ id, ...data, userId });
      if (!result.success) {
        return rejectWithValue(result.message || 'Update failed');
      }
      return result.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

export const deleteAudio = createAsyncThunk(
  'audio/deleteAudio',
  async ({ id, userId }: { id: string; userId: number }, { rejectWithValue }) => {
    try {
      const data = await audioApi.deleteAudio({ id, userId });
      if (!data.success) {
        return rejectWithValue(data.message || 'Delete failed');
      }
      return id;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

export const moveAudio = createAsyncThunk(
  'audio/moveAudio',
  async ({
    id,
    folderId,
    userId
  }: {
    id: string;
    folderId: string;
    userId: number
  }, { rejectWithValue }) => {
    try {
      const data = await audioApi.moveAudio({ id, folderId, userId });
      if (!data.success) {
        return rejectWithValue(data.message || 'Move failed');
      }
      return data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'audio/toggleFavorite',
  async ({ id, userId, isFavorite }: { id: string; userId: number; isFavorite: boolean }, { rejectWithValue }) => {
    try {
      const data = await audioApi.toggleFavorite({ id, userId, isFavorite });
      if (!data.success) {
        return rejectWithValue(data.message || 'Toggle favorite failed');
      }
      return { id, isFavorite };
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Upload failed');
      }
      return rejectWithValue('Upload failed');
    }
  }
);

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    mergeRecentlyListened: (state, action: PayloadAction<AudioTrack[]>) => {
      const newAudios = action.payload;
      const existingIds = new Set(state.audios.map(a => a.id));
      newAudios.forEach(audio => {
        if (!existingIds.has(audio.id)) {
          state.audios.push(audio);
        }
      });
    },
    updateAudioListenCount: (
      state,
      action: PayloadAction<{ id: string; listenCount: number }>
    ) => {
      const { id, listenCount } = action.payload;
      const audio = state.audios.find(a => String(a.id) === String(id));
      if (audio) {
        audio.listenCount = listenCount;
        if (listenCount > 0) {
          audio.status = undefined;
        }
      }
      if (state.currentAudio && String(state.currentAudio.id) === String(id)) {
        state.currentAudio.listenCount = listenCount;
        if (listenCount > 0) {
          state.currentAudio.status = undefined;
        }
      }
    },
    setCurrentAudio: (state, action: PayloadAction<AudioTrack | null>) => {
      state.currentAudio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudios.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAudios.fulfilled, (state, action) => {
        state.loading = false;
        state.audios = action.payload.map((audio: AudioTrack) => ({
          ...audio,
          listenCount: typeof audio.listenCount === "number" ? audio.listenCount : 0,
          status: audio.status || (audio.listenCount === 0 ? AudioStatus.NEW : undefined),
        }));
        const folderCounts = state.audios.reduce((acc: Record<string, number>, audio: AudioTrack) => {
          const fId = audio.folderId || '';
          acc[fId] = (acc[fId] || 0) + 1;
          return acc;
        }, {});
        state.folders = state.folders.map(folder => ({
          ...folder,
          _count: { audios: folderCounts[folder.id] || 0 }
        }));
      })
      .addCase(fetchAudios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch audios';
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        if (state.audios.length > 0) {
          const folderCounts = state.audios.reduce((acc: Record<string, number>, audio: AudioTrack) => {
            const fId = audio.folderId || '';
            acc[fId] = (acc[fId] || 0) + 1;
            return acc;
          }, {});
          state.folders = state.folders.map(folder => ({
            ...folder,
            _count: { audios: folderCounts[folder.id] || 0 }
          }));
        }
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch folders';
      })
      .addCase(uploadAudio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAudio.fulfilled, (state, action) => {
        state.loading = false;
        const newAudio = {
          ...action.payload,
          listenCount: typeof action.payload.listenCount === "number" ? action.payload.listenCount : 0,
          status: action.payload.status || (action.payload.listenCount === 0 ? AudioStatus.NEW : undefined),
        };
        state.audios.unshift(newAudio);
        state.uploadProgress = 0;
        const folder = state.folders.find(f => f.id === newAudio.folderId);
        if (folder && folder._count) {
          folder._count.audios += 1;
        }
      })
      .addCase(uploadAudio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })
      .addCase(updateAudio.fulfilled, (state, action) => {
        const index = state.audios.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.audios[index] = {
            ...action.payload,
            listenCount: typeof action.payload.listenCount === "number" ? action.payload.listenCount : 0,
            status: action.payload.status || (action.payload.listenCount === 0 ? AudioStatus.NEW : undefined),
          };
        }
      })
      .addCase(updateAudio.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteAudio.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAudio.fulfilled, (state, action) => {
        state.loading = false;
        const audioToDelete = state.audios.find(a => a.id === action.payload);
        if (audioToDelete) {
          const folder = state.folders.find(f => f.id === audioToDelete.folderId);
          if (folder && folder._count) {
            folder._count.audios -= 1;
          }
        }
        state.audios = state.audios.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAudio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(moveAudio.fulfilled, (state, action) => {
        const index = state.audios.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          const oldFolderId = state.audios[index].folderId;
          state.audios[index] = {
            ...action.payload,
            listenCount: typeof action.payload.listenCount === "number" ? action.payload.listenCount : 0,
            status: action.payload.status || (action.payload.listenCount === 0 ? AudioStatus.NEW : undefined),
          };
          const oldFolder = state.folders.find(f => f.id === oldFolderId);
          const newFolder = state.folders.find(f => f.id === action.payload.folderId);
          if (oldFolder && oldFolder._count) {
            oldFolder._count.audios -= 1;
          }
          if (newFolder && newFolder._count) {
            newFolder._count.audios += 1;
          }
        }
      })
      .addCase(moveAudio.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const audioId = action.payload.id;
        const audioIndex = state.audios.findIndex((a) => String(a.id) === String(audioId));
        if (audioIndex !== -1) {
          state.audios[audioIndex].isFavorite = action.payload.isFavorite;
        }
        if (state.currentAudio && String(state.currentAudio.id) === String(audioId)) {
          state.currentAudio.isFavorite = action.payload.isFavorite;
        }
      });
  },
});

export const {
  setUploadProgress,
  clearError,
  mergeRecentlyListened,
  updateAudioListenCount,
  setCurrentAudio,
} = audioSlice.actions;
export default audioSlice.reducer;