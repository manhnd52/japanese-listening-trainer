import { Router } from 'express';
import { generateQuizFromScript } from '../services/gemini.service.js';

const router = Router();

router.post('/generate-quiz', async (req, res) => {
  const { script, count } = req.body;
  if (!script) {
    return res.status(400).json({ success: false, message: 'Script is required' });
  }
  try {
    const quizzes = await generateQuizFromScript(script, count || 3);
    res.json({ success: true, data: quizzes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
