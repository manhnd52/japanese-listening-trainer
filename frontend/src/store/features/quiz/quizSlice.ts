import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quiz, QuizAttemptResult, QuizState } from '../../features/quiz/types';

const initialState: QuizState = {
  currentQuiz: null,
  result: null,
  isLoading: false,
  error: null,
  showModal: false,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Set current quiz (fetched from backend)
    setCurrentQuiz: (state, action: PayloadAction<Quiz>) => {
      state.currentQuiz = action.payload;
      state.result = null;
      state.error = null;
    },

    // Show quiz modal
    openQuizModal: (state) => {
      state.showModal = true;
    },

    // Hide quiz modal
    closeQuizModal: (state) => {
      state.showModal = false;
      state.currentQuiz = null;
      state.result = null;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set quiz result after submission
    setQuizResult: (state, action: PayloadAction<QuizAttemptResult>) => {
      state.result = action.payload;
      state.isLoading = false;
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset quiz state
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.result = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setCurrentQuiz,
  openQuizModal,
  closeQuizModal,
  setLoading,
  setQuizResult,
  setError,
  clearError,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
