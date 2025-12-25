import { prisma } from '../prisma/index.js';
import { QuizOption } from '../generated/prisma/client.js';
import { xpService } from './xp.service.js';

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
  async submitQuizAnswer(userId: number, quizId: number, selectedOption: QuizOption) {
    // 1. Lấy thông tin Quiz từ DB
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const isCorrect = quiz.correctOption === selectedOption;

    // 4. Lưu lịch sử làm bài (QuizAttemptLog)
    await prisma.quizAttemptLog.create({
      data: {
        userId,
        quizId,
        audioId: quiz.audioId,
        selectedOption,
        isCorrect,
      },
    });

    // 5. Logic MistakeQuiz (Ôn tập câu sai)
    if (!isCorrect) {
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
      // Nếu làm đúng thì xóa khỏi danh sách câu sai (nếu có)
      await prisma.mistakeQuiz.deleteMany({
        where: { userId, quizId },
      });
    }

    // 6. TÍNH ĐIỂM KINH NGHIỆM (XP)
    let xpResult;
    if (isCorrect) {
      // Cộng 20 XP nếu trả lời đúng (bạn có thể chỉnh số này)
      xpResult = await xpService.addXP(userId, 10);
    } else {
      const userExp = await prisma.userExp.findUnique({
        where: { userId },
      });
      const currentExp = userExp?.exp || 0;
      const level = Math.floor(currentExp / 100) + 1;
      // Trả về thông tin XP hiện tại mà không cộng thêm
      xpResult = {
        totalExp: currentExp,
        level,
        xpGained: 0,
        isLevelUp: false,
        currentLevelExp: currentExp % 100,
        nextLevelExp: 100,
      };
    }

    // 7. Trả về kết quả
    return {
      isCorrect,
      correctOption: quiz.correctOption,
      explanation: quiz.explanation,
      xp: xpResult, // Frontend cần cái này để thanh XP chạy
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
