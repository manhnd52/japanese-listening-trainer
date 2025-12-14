import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Folder } from '@/features/folder/types';
import { apiClient } from '@/lib/api';

interface FolderShare {
  id: number;
  userId: number;
  user: {
    id: number;
    fullname: string;
    email: string;
  };
}

interface FolderState {
  folders: Folder[];
  currentFolder: Folder | null;
  shares: FolderShare[];
  loading: boolean;
  error: string | null;
}

const initialState: FolderState = {
  folders: [],
  currentFolder: null,
  shares: [],
  loading: false,
  error: null,
};

// ========================
// Async Thunks
// ========================

// Share folder with user by email
export const shareFolder = createAsyncThunk(
  'folder/shareFolder',
  async ({ folderId, email }: { folderId: number; email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/folders/${folderId}/share`, { email });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to share folder');
    }
  }
);

// Get all shares for a folder
export const fetchFolderShares = createAsyncThunk(
  'folder/fetchFolderShares',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/folders/${folderId}/shares`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch folder shares');
    }
  }
);

// Unshare folder from a user
export const unshareFolder = createAsyncThunk(
  'folder/unshareFolder',
  async ({ folderId, userId }: { folderId: number; userId: number }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/folders/${folderId}/share/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to unshare folder');
    }
  }
);

/**
 * Fetch all folders for current user
 */
export const fetchFolders = createAsyncThunk(
  'folder/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/folders');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch folders');
    }
  }
);

/**
 * Fetch folder by ID with full details (including audios)
 */
export const fetchFolderById = createAsyncThunk(
  'folder/fetchFolderById',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/folders/${folderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch folder');
    }
  }
);

/**
 * Create new folder
 */
export const createFolder = createAsyncThunk(
  'folder/createFolder',
  async (data: { name: string; isPublic?: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/folders', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create folder');
    }
  }
);

/**
 * Update folder
 */
export const updateFolderThunk = createAsyncThunk(
  'folder/updateFolder',
  async ({ id, data }: { id: number; data: { name?: string; isPublic?: boolean } }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/folders/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update folder');
    }
  }
);

/**
 * Delete folder
 */
export const deleteFolder = createAsyncThunk(
  'folder/deleteFolder',
  async (folderId: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/folders/${folderId}`);
      return folderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete folder');
    }
  }
);

// ========================
// Slice
// ========================

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Share Folder
    builder.addCase(shareFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(shareFolder.fulfilled, (state, action) => {
      state.loading = false;
      // No need to update shares here, will refetch after
    });
    builder.addCase(shareFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Folder Shares
    builder.addCase(fetchFolderShares.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolderShares.fulfilled, (state, action) => {
      state.loading = false;
      state.shares = action.payload;
    });
    builder.addCase(fetchFolderShares.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Unshare Folder
    builder.addCase(unshareFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(unshareFolder.fulfilled, (state, action) => {
      state.loading = false;
      // No need to update shares here, will refetch after
    });
    builder.addCase(unshareFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ...existing code...
    // Fetch Folders
    builder.addCase(fetchFolders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolders.fulfilled, (state, action) => {
      state.loading = false;
      state.folders = action.payload;
    });
    builder.addCase(fetchFolders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Folder By ID
    builder.addCase(fetchFolderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolderById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentFolder = action.payload;
    });
    builder.addCase(fetchFolderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Folder
    builder.addCase(createFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createFolder.fulfilled, (state, action) => {
      state.loading = false;
      state.folders.unshift(action.payload);
    });
    builder.addCase(createFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Folder
    builder.addCase(updateFolderThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFolderThunk.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.folders.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
      if (state.currentFolder?.id === action.payload.id) {
        state.currentFolder = action.payload;
      }
    });
    builder.addCase(updateFolderThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Folder
    builder.addCase(deleteFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteFolder.fulfilled, (state, action) => {
      state.loading = false;
      state.folders = state.folders.filter(f => f.id !== action.payload);
      if (state.currentFolder?.id === action.payload) {
        state.currentFolder = null;
      }
    });
    builder.addCase(deleteFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentFolder, clearError } = folderSlice.actions;

export default folderSlice.reducer;
