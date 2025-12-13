import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action: Lưu thông tin khi đăng nhập thành công
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    // Action: Xóa thông tin khi đăng xuất
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    // Action: Cập nhật thông tin người dùng
    updateUser: (state, action: PayloadAction<User>) => {
      if (state.user) {
        state.user = action.payload;
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setCredentials, logout, updateUser} = authSlice.actions;
export default authSlice.reducer;