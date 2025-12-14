import { Router } from 'express';
import {
  getRandomQuiz,
  submitQuizAnswer,
  createQuiz,
  getQuizzesByAudio,
  deleteQuiz,
  getMistakeQuizzes,
} from '../controllers/quiz.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// IMPORTANT: More specific routes must come before generic routes
// GET /api/quizzes/random?audioId=123 - Get random quiz for audio
router.get('/random', authenticateToken, getRandomQuiz);

// DELETE /api/quizzes/:id - Delete quiz (must come before GET /)
router.delete('/:id', authenticateToken, deleteQuiz);

// GET /api/quizzes?audioId=123 - Get all quizzes for audio
router.get('/', authenticateToken, getQuizzesByAudio);

// POST /api/quizzes - Create new quiz
router.post('/', authenticateToken, createQuiz);

export default router;

// Separate router for quiz-attempts
export const quizAttemptRouter = Router();

// POST /api/quiz-attempts - Submit quiz answer
quizAttemptRouter.post('/', authenticateToken, submitQuizAnswer);

// Separate router for mistake-quizzes
export const mistakeQuizRouter = Router();

// GET /api/mistake-quizzes - Get mistake quizzes for review
mistakeQuizRouter.get('/', authenticateToken, getMistakeQuizzes);
