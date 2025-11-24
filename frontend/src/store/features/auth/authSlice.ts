import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'lucide-react';
import { UNSTABLE_REVALIDATE_RENAME_ERROR } from 'next/dist/lib/constants';

export interface UserData {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: UserData | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: { id: '4', name: 'Jane Doe', email: 'jane.doe@example.com' },
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserData>) {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
    updateUser(state, action: PayloadAction<Partial<UserData>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
