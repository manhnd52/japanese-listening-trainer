import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api";

/* =====================
   Types
===================== */

export interface FolderShare {
  id: number;
  userId: number;
  user: {
    id: number;
    fullname: string;
    email: string;
  };
}

interface SharingState {
  shares: FolderShare[];
  loading: boolean;
  error: string | null;
}

/* =====================
   Initial State
===================== */

const initialState: SharingState = {
  shares: [],
  loading: false,
  error: null,
};

/* =====================
   Async Thunks
===================== */

/**
 * Share folder by email
 * POST /api/folders/:folderId/share
 */
export const shareFolder = createAsyncThunk(
  "sharing/shareFolder",
  async (
    { folderId, email }: { folderId: number; email: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(
        `/folders/${folderId}/share`,
        { email }
      );
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to share folder"
      );
    }
  }
);

/**
 * Get folders shared with current user
 * GET /api/folders/shared
 */
export const fetchSharedFolders = createAsyncThunk(
  "sharing/fetchSharedFolders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/folders/shared");
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch shared folders"
      );
    }
  }
);

/**
 * Remove share
 * DELETE /api/folders/:folderId/share/:userId
 */
export const removeShare = createAsyncThunk(
  "sharing/removeShare",
  async (
    { folderId, userId }: { folderId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      await apiClient.delete(
        `/folders/${folderId}/share/${userId}`
      );
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to remove share"
      );
    }
  }
);

/* =====================
   Slice
===================== */

const sharingSlice = createSlice({
  name: "sharing",
  initialState,
  reducers: {
    clearSharingError(state) {
      state.error = null;
    },
    clearShares(state) {
      state.shares = [];
    },
  },
  extraReducers: (builder) => {
    /* ----- Share Folder ----- */
    builder.addCase(shareFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(shareFolder.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(shareFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ----- Fetch Shared Folders ----- */
    builder.addCase(fetchSharedFolders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchSharedFolders.fulfilled,
      (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.shares = action.payload;
      }
    );
    builder.addCase(fetchSharedFolders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    /* ----- Remove Share ----- */
    builder.addCase(removeShare.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      removeShare.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.shares = state.shares.filter(
          (s) => s.userId !== action.payload
        );
      }
    );
    builder.addCase(removeShare.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSharingError, clearShares } = sharingSlice.actions;

export default sharingSlice.reducer;
