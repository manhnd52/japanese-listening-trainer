import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserStats {
  streak: number;
  level: number;
  exp: number;
  lastActiveDate?: string;
}

interface UserState {
  stats: UserStats;
  isCompletedToday?: boolean;
}

const initialState: UserState = {
  stats: {
    streak: 0,
    level: 1,
    exp: 0,
  },
  isCompletedToday: false,
};

const checkIsToday = (dateString?: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<UserStats>) {
      state.stats = action.payload;
      state.isCompletedToday = checkIsToday(action.payload.lastActiveDate);
    },
    updateUserStreak(state, action: PayloadAction<{ streak: number; lastActiveDate: string }>) {
      if (state.stats) {
        state.stats.streak = action.payload.streak;
        state.stats.lastActiveDate = action.payload.lastActiveDate;
        state.isCompletedToday = true; // ✅ Bật đèn sáng ngay lập tức
      }
    },
    addExp(state, action: PayloadAction<number>) {
      state.stats.exp += action.payload;

      if (state.stats.exp >= 100) {
        state.stats.level += 1;
        state.stats.exp -= 100;
      }
    },
    increaseStreak(state) {
      state.stats.streak += 1;
    },
    resetStreak(state) {
      state.stats.streak = 0;
    },
  },
});

export const { setStats, addExp, increaseStreak, resetStreak, updateUserStreak } =
  userSlice.actions;
export default userSlice.reducer;
