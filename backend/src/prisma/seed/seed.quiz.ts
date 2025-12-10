import { prisma } from '../index';

export async function seedQuizzes(userId: number, audioIds: number[]) {
    console.log('🌱 Seeding quizzes...');

    const quizzesData = [];

    // Create 2-3 quizzes for each audio
    for (const audioId of audioIds) {
        const numQuizzes = Math.floor(Math.random() * 2) + 2; // 2-3 quizzes per audio

        for (let i = 0; i < numQuizzes; i++) {
            quizzesData.push({
                userId,
                audioId,
                questionText: `Question ${i + 1} for audio ${audioId}: What did you hear?`,
                optionA: 'Option A - First answer',
                optionB: 'Option B - Second answer',
                optionC: 'Option C - Third answer',
                optionD: 'Option D - Fourth answer',
                correctOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] as any,
                explanation: `This is the explanation for question ${i + 1}. The correct answer is because...`,
            });
        }
    }

    const createdQuizzes = [];
    for (const quizData of quizzesData) {
        const quiz = await prisma.quiz.create({
            data: quizData,
        });
        createdQuizzes.push(quiz);
    }

    console.log(`✅ Created ${createdQuizzes.length} quizzes`);
    return createdQuizzes;
}
