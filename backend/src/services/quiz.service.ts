import { prisma } from '../prisma/index.js';
import { QuizOption } from '../generated/prisma/client.js';

export class QuizService {
  /**
   * Fetch a random quiz for a specific audio
   * Used when user finishes audio or clicks Quiz button
   */
  async getRandomQuizByAudio(audioId: number) {
    const quizzes = await prisma.quiz.findMany({
      where: { audioId },
    });

    if (quizzes.length === 0) {
      throw new Error('No quiz available for this audio');
    }

    // Randomly select one quiz
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    return quizzes[randomIndex];
  }

  /**
   * Submit quiz answer - CRITICAL FLOW
   * 1. Check correctness
   * 2. Create QuizAttemptLog
   * 3. Update or create QuizStats
   * 4. If wrong → insert MistakeQuiz
   * 5. Return result with feedback
   */
  async submitQuizAnswer(data: {
    quizId: number;
    userId: number;
    selectedOption: QuizOption;
  }) {
    const { quizId, userId, selectedOption } = data;

    // 1. Fetch quiz to check correctness
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { audio: true },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const isCorrect = quiz.correctOption === selectedOption;
    const audioId = quiz.audioId;

    // 2. Create QuizAttemptLog
    await prisma.quizAttemptLog.create({
      data: {
        quizId,
        userId,
        audioId,
        selectedOption,
        isCorrect,
      },
    });

    // 3. Update or create QuizStats
    const existingStats = await prisma.quizStats.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
    });

    if (existingStats) {
      await prisma.quizStats.update({
        where: {
          userId_quizId: {
            userId,
            quizId,
          },
        },
        data: {
          correctCount: isCorrect
            ? existingStats.correctCount + 1
            : existingStats.correctCount,
          wrongCount: !isCorrect
            ? existingStats.wrongCount + 1
            : existingStats.wrongCount,
        },
      });
    } else {
      await prisma.quizStats.create({
        data: {
          userId,
          quizId,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: !isCorrect ? 1 : 0,
        },
      });
    }

    // 4. If wrong → insert MistakeQuiz
    if (!isCorrect) {
      // Check if already exists (to avoid duplicate)
      const existingMistake = await prisma.mistakeQuiz.findFirst({
        where: {
          userId,
          quizId,
        },
      });

      if (!existingMistake) {
        await prisma.mistakeQuiz.create({
          data: {
            userId,
            quizId,
          },
        });
      }
    } else {
      // If correct during review, remove from MistakeQuiz
      await prisma.mistakeQuiz.deleteMany({
        where: {
          userId,
          quizId,
        },
      });
    }

    // 5. Calculate EXP (simple: 10 for correct, 0 for wrong)
    const expGained = isCorrect ? 10 : 0;

    // 6. Return result
    return {
      isCorrect,
      correctOption: quiz.correctOption,
      explanation: quiz.explanation,
      expGained,
    };
  }

  /**
   * Create a new quiz
   * Used in Add Audio / Audio Detail flows
   */
  async createQuiz(data: {
    userId: number;
    audioId: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: QuizOption;
    explanation?: string;
  }) {
    return await prisma.quiz.create({
      data,
    });
  }

  /**
   * Get all quizzes for a specific audio
   */
  async getQuizzesByAudio(audioId: number) {
    return await prisma.quiz.findMany({
      where: { audioId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: number) {
    // Delete related records first (cascade)
    await prisma.$transaction([
      prisma.quizAttemptLog.deleteMany({ where: { quizId } }),
      prisma.quizStats.deleteMany({ where: { quizId } }),
      prisma.mistakeQuiz.deleteMany({ where: { quizId } }),
      prisma.quiz.delete({ where: { id: quizId } }),
    ]);
  }

  /**
   * Get mistake quizzes for review
   */
  async getMistakeQuizzes(userId: number) {
    const mistakes = await prisma.mistakeQuiz.findMany({
      where: { userId },
      include: {
        quiz: true,
      },
      orderBy: { wrongAt: 'desc' },
    });

    return mistakes.map((m) => m.quiz);
  }
}
