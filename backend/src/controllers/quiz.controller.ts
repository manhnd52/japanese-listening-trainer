import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service';
import { QuizOption } from '../generated/prisma/client';

const quizService = new QuizService();

/**
 * GET /api/quizzes/random?audioId=123
 * Fetch a random quiz for a specific audio
 */
export const getRandomQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('[Quiz Controller] getRandomQuiz called');
  console.log('[Quiz Controller] Query params:', req.query);
  console.log('[Quiz Controller] Full URL:', req.originalUrl);
  
  try {
    const { audioId } = req.query;

    if (!audioId) {
      console.log('[Quiz Controller] audioId is missing');
      return res.status(400).json({
        success: false,
        message: 'audioId is required',
      });
    }

    console.log('[Quiz Controller] Fetching quiz for audioId:', audioId);
    const quiz = await quizService.getRandomQuizByAudio(Number(audioId));
    console.log('[Quiz Controller] Quiz found:', quiz?.id);

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error: any) {
    console.error('[Quiz Controller] Error:', error.message);
    if (error.message === 'No quiz available for this audio') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/quiz-attempts
 * Submit quiz answer
 * Body: { quizId, selectedOption }
 * Returns: { isCorrect, correctOption, explanation, expGained }
 */
export const submitQuizAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId, selectedOption } = req.body;

    // TEMP: Hardcoded userId=31 for testing
    // TODO: Restore to req.user?.id after fixing auth
    // @ts-ignore
    // const userId = req.user?.id;
    const userId = 31;

    if (!quizId || !selectedOption) {
      return res.status(400).json({
        success: false,
        message: 'quizId and selectedOption are required',
      });
    }

    // Validate selectedOption is valid enum
    if (!Object.values(QuizOption).includes(selectedOption)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid selectedOption. Must be A, B, C, or D',
      });
    }

    const result = await quizService.submitQuizAnswer({
      quizId: Number(quizId),
      userId,
      selectedOption,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Quiz not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * POST /api/quizzes
 * Create a new quiz
 */
export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { audioId, questionText, optionA, optionB, optionC, optionD, correctOption, explanation } = req.body;

    // TEMP: Hardcoded userId=31 for testing
    // TODO: Restore to req.user?.id after fixing auth
    // @ts-ignore
    // const userId = req.user?.id;
    const userId = 31;

    if (!audioId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({
        success: false,
        message: 'All quiz fields are required',
      });
    }

    if (!Object.values(QuizOption).includes(correctOption)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid correctOption. Must be A, B, C, or D',
      });
    }

    const quiz = await quizService.createQuiz({
      userId,
      audioId: Number(audioId),
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quizzes?audioId=123
 * Get all quizzes for a specific audio
 */
export const getQuizzesByAudio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { audioId } = req.query;

    if (!audioId) {
      return res.status(400).json({
        success: false,
        message: 'audioId is required',
      });
    }

    const quizzes = await quizService.getQuizzesByAudio(Number(audioId));

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz
 */
export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await quizService.deleteQuiz(Number(id));

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mistake-quizzes
 * Get all mistake quizzes for review
 */
export const getMistakeQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const quizzes = await quizService.getMistakeQuizzes(userId);

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};
