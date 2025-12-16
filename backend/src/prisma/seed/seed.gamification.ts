import { prisma } from '../index.js';

export async function seedGamification(userId: number) {
    console.log('🌱 Seeding gamification data...');

    // UserExp
    const userExp = await prisma.userExp.create({
        data: {
            userId,
            exp: 250,
        },
    });
    console.log(`✅ Created user exp: ${userExp.exp} XP`);

    // Streak
    const streak = await prisma.streak.create({
        data: {
            userId,
            currentStreak: 5,
            longestStreak: 7,
            lastActiveDate: new Date(),
        },
    });
    console.log(`✅ Created streak: ${streak.currentStreak} days (longest: ${streak.longestStreak})`);

    // LeaderboardPoint
    const leaderboardPoint = await prisma.leaderboardPoint.create({
        data: {
            userId,
            weeklyExp: 150,
        },
    });
    console.log(`✅ Created leaderboard points: ${leaderboardPoint.weeklyExp} weekly XP`);

    return { userExp, streak, leaderboardPoint };
}
