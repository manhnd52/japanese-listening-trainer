import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!GEMINI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('GEMINI_API_KEY is not set in backend .env');
}

export interface AIGeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuizFromScript(script: string, count: number = 3): Promise<AIGeneratedQuiz[]> {
  const prompt = `Generate ${count} multiple-choice quiz questions based on the following Japanese audio transcript or text.\n\nThe questions should test listening comprehension and understanding of the content.\nEach question should have exactly 4 options (A, B, C, D).\nMake the questions varied: some about main ideas, some about details, some about vocabulary or expressions used.\n\nText: "${script.substring(0, 3000)}${script.length > 3000 ? '...' : ''}"\n\nGenerate the quiz in the same language as the text (if Japanese, questions in Japanese).\n\nReturn ONLY a valid JSON array with this exact structure (no markdown, no explanation):\n[\n  {\n    "question": "Your question here",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctAnswer": 0,\n    "explanation": "Brief explanation"\n  }\n]`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    let responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (responseText) {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      else if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      cleanedText = cleanedText.trim();
      const data = JSON.parse(cleanedText) as AIGeneratedQuiz[];
      return data.filter(q => q.options && q.options.length === 4 && q.correctAnswer >= 0 && q.correctAnswer <= 3);
    }
    return [];
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Gemini Quiz Generation Error:', error?.response?.data || error);
    throw new Error('Failed to generate quiz with Gemini API');
  }
}
