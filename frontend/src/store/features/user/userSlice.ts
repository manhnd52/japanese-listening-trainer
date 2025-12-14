import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserStats {
  streak: number;
  level: number;
  exp: number;
}

interface UserState {
  stats: UserStats;
}

const initialState: UserState = {
  stats: {
    streak: 0,
    level: 1,
    exp: 0,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<UserStats>) {
      state.stats = action.payload;
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
    updateUserStats: (state, action) => {
      if (state.stats) {
        state.stats.streak = action.payload.streak;
      }
    },
  },
});

export const { setStats, addExp, increaseStreak, resetStreak, updateUserStats } =
  userSlice.actions;
export default userSlice.reducer;
