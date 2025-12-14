import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Folder } from '@/features/folder/types';

interface FolderState {
  folders: Folder[];
  currentFolder: Folder | null;
  loading: boolean;
  error: string | null;
}

const initialState: FolderState = {
  folders: [],
  currentFolder: null,
  loading: false,
  error: null,
};

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setFolders: (state, action: PayloadAction<Folder[]>) => {
      state.folders = action.payload;
    },
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    addFolder: (state, action: PayloadAction<Folder>) => {
      state.folders.unshift(action.payload);
    },
    updateFolder: (state, action: PayloadAction<Folder>) => {
      const index = state.folders.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
      if (state.currentFolder?.id === action.payload.id) {
        state.currentFolder = action.payload;
      }
    },
    removeFolder: (state, action: PayloadAction<number>) => {
      state.folders = state.folders.filter(f => f.id !== action.payload);
      if (state.currentFolder?.id === action.payload) {
        state.currentFolder = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFolders,
  setCurrentFolder,
  addFolder,
  updateFolder,
  removeFolder,
  setLoading,
  setError,
} = folderSlice.actions;

export default folderSlice.reducer;
