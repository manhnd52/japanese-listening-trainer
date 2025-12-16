import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Quiz, QuizAttemptResult, QuizState } from '@/features/quiz/types.js';

const initialState: QuizState = {
  currentQuiz: null,
  allQuizzes: [],
  currentIndex: 0,
  result: null,
  isLoading: false,
  error: null,
  showModal: false,
  mode: 'random',
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

    // Set all quizzes for "all quizzes" mode
    setAllQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.allQuizzes = action.payload;
      state.currentIndex = 0;
      state.currentQuiz = action.payload[0] || null;
      state.result = null;
      state.error = null;
      state.mode = 'all';
    },

    // Move to next quiz in "all quizzes" mode
    nextQuiz: (state) => {
      if (state.currentIndex < state.allQuizzes.length - 1) {
        state.currentIndex += 1;
        state.currentQuiz = state.allQuizzes[state.currentIndex];
        state.result = null;
      }
    },

    // Check if there's a next quiz
    setMode: (state, action: PayloadAction<'random' | 'all'>) => {
      state.mode = action.payload;
    },

    // Show quiz modal
    openQuizModal: (state) => {
      state.showModal = true;
    },

    // Hide quiz modal
    closeQuizModal: (state) => {
      state.showModal = false;
      state.currentQuiz = null;
      state.allQuizzes = [];
      state.currentIndex = 0;
      state.result = null;
      state.error = null;
      state.mode = 'random';
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
  setAllQuizzes,
  nextQuiz,
  setMode,
  openQuizModal,
  closeQuizModal,
  setLoading,
  setQuizResult,
  setError,
  clearError,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
