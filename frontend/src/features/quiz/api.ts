import { apiClient } from '@/lib/api';
import { Quiz, QuizAttemptInput, QuizAttemptResult } from './types';
import { QuizOption } from './types';

/**
 * Fetch a random quiz for a specific audio
 * Backend should randomly select one quiz by audioId
 */
export const fetchQuizByAudio = async (audioId: number): Promise<Quiz> => {
  console.log('[Quiz API] Fetching quiz for audioId:', audioId);
  console.log('[Quiz API] Full URL will be:', `/quizzes/random?audioId=${audioId}`);
  
  try {
    const response = await apiClient.get<{ success: boolean; data: Quiz }>(`/quizzes/random`, {
      params: { audioId },
    });
    console.log('[Quiz API] Response:', response.data);
    // Backend returns { success: true, data: quiz }
    return response.data.data;
  } catch (error: any) {
    console.error('[Quiz API] Error status:', error.response?.status);
    console.error('[Quiz API] Error data:', error.response?.data);
    throw error;
  }
};

/**
 * Submit quiz answer
 * Backend validates, logs attempt, updates stats, and returns result
 */
export const submitQuizAnswer = async (
  data: QuizAttemptInput
): Promise<QuizAttemptResult> => {
  console.log('[Quiz API] Submitting answer:', data);
  try {
    const response = await apiClient.post<{ success: boolean; data: QuizAttemptResult }>('/quiz-attempts', data);
    console.log('[Quiz API] Submit response:', response.data);
    // Backend returns { success: true, data: result }
    return response.data.data;
  } catch (error: any) {
    console.error('[Quiz API] Submit error:', error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Create a new quiz (for Add Audio / Audio Detail flows)
 */
export const createQuiz = async (quizData: {
  audioId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuizOption;
  explanation?: string;
}): Promise<Quiz> => {
  console.log('[Quiz API] Creating quiz:', quizData);
  const response = await apiClient.post<{ success: boolean; data: Quiz }>('/quizzes', quizData);
  console.log('[Quiz API] Create response:', response.data);
  return response.data.data;
};

/**
 * Get all quizzes for a specific audio
 */
export const getQuizzesByAudio = async (audioId: number): Promise<Quiz[]> => {
  console.log('[Quiz API] Fetching all quizzes for audioId:', audioId);
  const response = await apiClient.get<{ success: boolean; data: Quiz[] }>(`/quizzes`, {
    params: { audioId },
  });
  console.log('[Quiz API] All quizzes response:', response.data);
  // Backend returns { success: true, data: quizzes[] }
  return response.data.data;
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
  console.log('[Quiz API] Fetching mistake quizzes');
  const response = await apiClient.get<{ success: boolean; data: Quiz[] }>('/mistake-quizzes');
  console.log('[Quiz API] Mistake quizzes response:', response.data);
  return response.data.data;
};
