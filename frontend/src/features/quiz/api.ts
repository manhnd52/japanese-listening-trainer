import { apiClient } from '@/lib/api';
import { Quiz, QuizAttemptInput, QuizAttemptResult } from './types';

/**
 * Fetch a random quiz for a specific audio
 * Backend should randomly select one quiz by audioId
 */
export const fetchQuizByAudio = async (audioId: number): Promise<Quiz> => {
  const response = await apiClient.get<Quiz>(`/quizzes/random`, {
    params: { audioId },
  });
  return response.data;
};

/**
 * Submit quiz answer
 * Backend validates, logs attempt, updates stats, and returns result
 */
export const submitQuizAnswer = async (
  data: QuizAttemptInput
): Promise<QuizAttemptResult> => {
  const response = await apiClient.post<QuizAttemptResult>('/quiz-attempts', data);
  return response.data;
};

/**
 * Create a new quiz (for Add Audio / Audio Detail flows)
 */
export const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
  const response = await apiClient.post<Quiz>('/quizzes', quizData);
  return response.data;
};

/**
 * Get all quizzes for a specific audio
 */
export const getQuizzesByAudio = async (audioId: number): Promise<Quiz[]> => {
  const response = await apiClient.get<Quiz[]>(`/quizzes`, {
    params: { audioId },
  });
  return response.data;
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (quizId: number): Promise<void> => {
  await apiClient.delete(`/quizzes/${quizId}`);
};

/**
 * Get mistake quizzes for review
 */
export const getMistakeQuizzes = async (): Promise<Quiz[]> => {
  const response = await apiClient.get<Quiz[]>('/mistake-quizzes');
  return response.data;
};
