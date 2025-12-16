'use client';

import { useAppDispatch } from '@/hooks/redux';
import { setCurrentQuiz, setAllQuizzes, openQuizModal, setLoading, setError, setMode } from '@/store/features/quiz/quizSlice.js';
import { fetchQuizByAudio, getQuizzesByAudio } from './api.js';

/**
 * Custom hook for quiz operations
 */
export const useQuiz = () => {
  const dispatch = useAppDispatch();

  /**
   * Trigger quiz modal with a random quiz for a specific audio
   */
  const triggerQuiz = async (audioId: number) => {
    dispatch(setLoading(true));
    dispatch(setMode('random'));
    
    try {
      const quiz = await fetchQuizByAudio(audioId);
      dispatch(setCurrentQuiz(quiz));
      dispatch(openQuizModal());
    } catch (error: any) {
      const message = error.response?.data?.message || 'No quiz available for this audio';
      dispatch(setError(message));
      console.error('Failed to fetch quiz:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Trigger quiz modal with ALL quizzes for a specific audio
   * User will go through each quiz sequentially
   */
  const triggerAllQuizzes = async (audioId: number) => {
    dispatch(setLoading(true));
    dispatch(setMode('all'));
    
    try {
      const quizzes = await getQuizzesByAudio(audioId);
      if (quizzes.length === 0) {
        dispatch(setError('No quizzes available for this audio'));
        return;
      }
      dispatch(setAllQuizzes(quizzes));
      dispatch(openQuizModal());
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch quizzes';
      dispatch(setError(message));
      console.error('Failed to fetch all quizzes:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    triggerQuiz,
    triggerAllQuizzes,
  };
};
