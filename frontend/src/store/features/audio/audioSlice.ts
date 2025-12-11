import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AudioTrack, Folder } from '@/types/types';

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
}

const initialState: AudioState = {
  audios: [],
  folders: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
export const fetchAudios = createAsyncThunk(
  'audio/fetchAudios',
  async () => {
    const response = await fetch('http://localhost:5000/api/audios');
    const data = await response.json();
    return data.data;
  }
);

export const fetchFolders = createAsyncThunk(
  'audio/fetchFolders',
  async (userId: number) => {
    const response = await fetch(`http://localhost:5000/api/audios/folders?userId=${userId}`);
    const data = await response.json();
    return data.data;
  }
);

export const uploadAudio = createAsyncThunk(
  'audio/uploadAudio',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/audios', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Upload failed');
      }
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Audios
      .addCase(fetchAudios.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAudios.fulfilled, (state, action) => {
        state.loading = false;
        state.audios = action.payload;
        
        // Tính số lượng audio cho mỗi folder
        const folderCounts = action.payload.reduce((acc: any, audio: AudioTrack) => {
          acc[audio.folderId] = (acc[audio.folderId] || 0) + 1;
          return acc;
        }, {});
        
        // Cập nhật count cho folders
        state.folders = state.folders.map(folder => ({
          ...folder,
          _count: { audios: folderCounts[folder.id] || 0 }
        }));
      })
      .addCase(fetchAudios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch audios';
      })
      // Fetch Folders
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        
        // Nếu đã có audios, tính lại count
        if (state.audios.length > 0) {
          const folderCounts = state.audios.reduce((acc: any, audio: AudioTrack) => {
            acc[audio.folderId] = (acc[audio.folderId] || 0) + 1;
            return acc;
          }, {});
          
          state.folders = state.folders.map(folder => ({
            ...folder,
            _count: { audios: folderCounts[folder.id] || 0 }
          }));
        }
      })
      // Upload Audio
      .addCase(uploadAudio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAudio.fulfilled, (state, action) => {
        state.loading = false;
        state.audios.unshift(action.payload);
        state.uploadProgress = 0;
        
        // Cập nhật count cho folder
        const folder = state.folders.find(f => f.id === action.payload.folderId);
        if (folder && folder._count) {
          folder._count.audios += 1;
        }
      })
      .addCase(uploadAudio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });
  },
});

export const { setUploadProgress, clearError } = audioSlice.actions;
export default audioSlice.reducer;