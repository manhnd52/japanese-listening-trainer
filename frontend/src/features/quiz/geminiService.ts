import { GoogleGenAI, Type, Schema } from "@google/genai";

// Types for AI-generated quiz
export interface AIGeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string;
}

// Initialize Gemini Client
const getAIClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('NEXT_PUBLIC_GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
};

// Model to use
const TEXT_MODEL = 'gemini-2.5-flash';

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
  const ai = getAIClient();
  
  const prompt = `Generate ${count} multiple-choice quiz questions based on the following Japanese audio transcript or text.
  
The questions should test listening comprehension and understanding of the content.
Each question should have exactly 4 options (A, B, C, D).
Make the questions varied: some about main ideas, some about details, some about vocabulary or expressions used.

Text: "${script.substring(0, 3000)}${script.length > 3000 ? '...' : ''}"

Generate the quiz in the same language as the text (if Japanese, questions in Japanese).`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "The quiz question" },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Array of 4 answer options"
        },
        correctAnswer: { 
          type: Type.INTEGER, 
          description: "Index of the correct option (0-3)" 
        },
        explanation: { 
          type: Type.STRING, 
          description: "Brief explanation of why the answer is correct"
        },
      },
      required: ["question", "options", "correctAnswer", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as AIGeneratedQuiz[];
      // Validate each quiz has 4 options
      return data.filter(q => 
        q.options && 
        q.options.length === 4 && 
        q.correctAnswer >= 0 && 
        q.correctAnswer <= 3
      );
    }
    return [];
  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz with AI. Please try again.");
  }
};

/**
 * Generates a context/overview description for an audio script.
 * @param script - The audio transcript
 * @returns A brief description of the audio content
 */
export const generateContextDescription = async (script: string): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `Write a short, immersive context description (approx 20-30 words) for the following script. 
Summarize the situation or context of the dialogue in narrative style.

Example:
Dialogue: "A: Hey, you look tired. Did you sleep enough last night? B: Not really. I stayed up finishing a project."
Description: "A notices that B looks tired and asks if he didn't sleep well last night."

Script: "${script.substring(0, 2000)}${script.length > 2000 ? '...' : ''}"`;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
    });
    return response.text || "Could not generate overview.";
  } catch (error) {
    console.error("Gemini Overview Error:", error);
    return "Unable to generate context overview at this time.";
  }
};
