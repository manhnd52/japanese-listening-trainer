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
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/audios?userId=${userId}`);
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch audios');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch audios');
    }
  }
);

export const fetchFolders = createAsyncThunk(
  'audio/fetchFolders',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/audios/folders?userId=${userId}`);
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch folders');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch folders');
    }
  }
);

export const uploadAudio = createAsyncThunk(
  'audio/uploadAudio',
  async ({ formData, userId }: { formData: FormData; userId: number }, { rejectWithValue }) => {
    try {
      // ✅ Thêm userId vào formData
      formData.append('userId', userId.toString());
      
      const response = await fetch('http://localhost:5000/api/audios', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Upload failed');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
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
      const response = await fetch(`http://localhost:5000/api/audios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }), // ✅ Thêm userId vào body
      });
      const result = await response.json();
      if (!result.success) {
        return rejectWithValue(result.message || 'Update failed');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Update failed');
    }
  }
);

export const deleteAudio = createAsyncThunk(
  'audio/deleteAudio',
  async ({ id, userId }: { id: string; userId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/audios/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Delete failed');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Delete failed');
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
      const response = await fetch(`http://localhost:5000/api/audios/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: Number(folderId), userId }), // ✅ Thêm userId vào body
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || 'Move failed');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Move failed');
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
        const folderCounts = action.payload.reduce((acc: Record<string, number>, audio: AudioTrack) => {
          const fId = audio.folderId || '';
          acc[fId] = (acc[fId] || 0) + 1;
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
        state.error = action.payload as string || 'Failed to fetch audios';
      })
      // Fetch Folders
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        
        // Nếu đã có audios, tính lại count
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
      })
      // Update Audio
      .addCase(updateAudio.fulfilled, (state, action) => {
        const index = state.audios.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.audios[index] = action.payload;
        }
      })
      .addCase(updateAudio.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete Audio
      .addCase(deleteAudio.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAudio.fulfilled, (state, action) => {
        state.loading = false;
        const audioToDelete = state.audios.find(a => a.id === action.payload);
        if (audioToDelete) {
          // Giảm count của folder
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
      // Move Audio
      .addCase(moveAudio.fulfilled, (state, action) => {
        const index = state.audios.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          const oldFolderId = state.audios[index].folderId;
          state.audios[index] = action.payload;
          
          // Cập nhật count: giảm folder cũ, tăng folder mới
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
      });
  },
});

export const { setUploadProgress, clearError } = audioSlice.actions;
export default audioSlice.reducer;