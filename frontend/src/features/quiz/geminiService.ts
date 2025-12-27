import { apiClient } from '@/lib/api';

// Types for AI-generated quiz
export interface AIGeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string;
}



/**
 * Generates a list of quiz questions based on the provided script/transcript.
 * @param script - The audio transcript or script text
 * @param count - Number of quiz questions to generate (default: 3)
 * @returns Array of AI-generated quiz objects
 */
export const generateQuizFromScript = async (
  script: string,
  count: number = 3
): Promise<AIGeneratedQuiz[]> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: AIGeneratedQuiz[] }>('/gemini/generate-quiz', { script, count });
    return response.data.data;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Gemini Quiz Generation Error:', error?.response?.data || error);
    throw new Error('Failed to generate quiz with Gemini API');
  }
};

/**
 * Generates a context/overview description for an audio script.
 * @param script - The audio transcript
 * @returns A brief description of the audio content
 */
// (Optional) You can implement a similar backend endpoint for context description if needed
