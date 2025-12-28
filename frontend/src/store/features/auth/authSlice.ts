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
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        document.cookie = 'accessToken=; path=/; max-age=0';
      }
    },
    // Action: Cập nhật thông tin người dùng
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const newData = { ...state.user, ...action.payload };

        if (action.payload.fullname) {
          newData.fullname = action.payload.fullname;
        }

        state.user = newData;
      }
    },
  },
});

export const { setCredentials, logout, updateUser} = authSlice.actions;
export default authSlice.reducer;