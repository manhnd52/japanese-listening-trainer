import { prisma } from '../index.js';
import { seedUsers } from './seed.user.js';
import { seedFolders } from './seed.folder.js';
import { seedAudios } from './seed.audio.js';
import { seedAudioStats } from './seed.audioStats.js';
import { seedUserSettings } from './seed.userSetting.js';
import { seedGamification } from './seed.gamification.js';
import { seedAchievements, seedUserAchievements } from './seed.achievement.js';
import { seedQuizzes } from './seed.quiz.js';

async function main() {
    console.log('🚀 Starting database seeding...\n');

    try {
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await prisma.userAchievement.deleteMany();
        await prisma.achievement.deleteMany();
        await prisma.quizAttemptLog.deleteMany();
        await prisma.quizStats.deleteMany();
        await prisma.mistakeQuiz.deleteMany();
        await prisma.quiz.deleteMany();
        await prisma.audioStats.deleteMany();
        await prisma.audio.deleteMany();
        await prisma.folderShare.deleteMany();
        await prisma.folder.deleteMany();
        await prisma.userSetting.deleteMany();
        await prisma.userDailyActivity.deleteMany();
        await prisma.userExp.deleteMany();
        await prisma.streak.deleteMany();
        await prisma.leaderboardPoint.deleteMany();
        await prisma.reminder.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();
        console.log('✅ Cleared existing data\n');

        // Seed in order of dependencies
        const user = await seedUsers();
        console.log('');

        const folders = await seedFolders(user.id);
        console.log('');

        const audios = await seedAudios(user.id, folders);
        const audioIds = audios.map(a => a.id);
        console.log('');

        const audioStats = await seedAudioStats(user.id, audioIds);
        console.log('');

        const userSetting = await seedUserSettings(user.id);
        console.log('');

        const gamification = await seedGamification(user.id);
        console.log('');

        const achievements = await seedAchievements();
        const achievementIds = achievements.map(a => a.id);
        console.log('');

        const userAchievements = await seedUserAchievements(user.id, achievementIds);
        console.log('');

        const quizzes = await seedQuizzes(user.id, audioIds);
        console.log('');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: 1`);
        console.log(`   - Folders: ${folders.length}`);
        console.log(`   - Audios: ${audios.length}`);
        console.log(`   - Audio Stats: ${audioStats.length}`);
        console.log(`   - User Settings: 1`);
        console.log(`   - User XP: ${gamification.userExp.exp}`);
        console.log(`   - Streak: ${gamification.streak.currentStreak} days`);
        console.log(`   - Achievements: ${achievements.length} (${userAchievements.length} unlocked)`);
        console.log(`   - Quizzes: ${quizzes.length}`);
        console.log('\n🔑 Demo credentials:');
        console.log('   Email: demo@example.com');
        console.log('   Password: password123');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
