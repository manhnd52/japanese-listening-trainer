'use client';

import { useAppDispatch } from '@/hooks/redux';
import { setCurrentQuiz, openQuizModal, setLoading, setError } from '@/store/features/quiz/quizSlice';
import { fetchQuizByAudio } from './api';

/**
 * Custom hook for quiz operations
 */
export const useQuiz = () => {
  const dispatch = useAppDispatch();

  /**
   * Trigger quiz modal for a specific audio
   * Fetches a random quiz from backend and shows modal
   */
  const triggerQuiz = async (audioId: number) => {
    dispatch(setLoading(true));
    
    try {
      const quiz = await fetchQuizByAudio(audioId);
      dispatch(setCurrentQuiz(quiz));
      dispatch(openQuizModal());
    } catch (error: any) {
      const message = error.response?.data?.message || 'No quiz available for this audio';
      dispatch(setError(message));
      console.error('Failed to fetch quiz:', error);
    }
  };

  return {
    triggerQuiz,
  };
};
