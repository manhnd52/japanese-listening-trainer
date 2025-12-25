'use client';

import { useAppDispatch } from '@/hooks/redux';
import { setCurrentQuiz, setAllQuizzes, openQuizModal, setLoading, setError, setMode } from '@/store/features/quiz/quizSlice';
import { fetchQuizByAudio, getQuizzesByAudio, submitQuizAnswer } from './api';
import { updateXP } from '@/store/features/user/userSlice';
import { useCallback } from 'react';
import { QuizOption } from './types';

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

  const submitQuiz = useCallback(async (quizId: number, selectedOption: QuizOption) => {
    try {
      // Gọi API (Hàm này trong api.ts trả về data kết quả trực tiếp)
      const result = await submitQuizAnswer({ quizId, selectedOption });
      
      // ✅ LOGIC CẬP NHẬT XP:
      // Kiểm tra xem kết quả trả về có chứa thông tin XP không
      if (result && result.xp) {
          console.log("🔥 Updating XP:", result.xp);
          dispatch(updateXP(result.xp));
      }

      return result;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error; 
    }
  }, [dispatch]);

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
    submitQuiz,
  };
};
