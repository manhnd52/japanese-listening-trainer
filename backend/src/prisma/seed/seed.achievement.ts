import { prisma, AchievementConditionType } from '../index';

export async function seedAchievements() {
    console.log('🌱 Seeding achievements...');

    const achievementsData = [
        {
            name: 'First Steps',
            description: 'Complete your first audio lesson',
            iconUrl: '/icons/achievement-first.png',
            conditionType: AchievementConditionType.audio_count,
            conditionValue: 1,
        },
        {
            name: 'Getting Started',
            description: 'Complete 5 audio lessons',
            iconUrl: '/icons/achievement-5.png',
            conditionType: AchievementConditionType.audio_count,
            conditionValue: 5,
        },
        {
            name: 'Dedicated Learner',
            description: 'Complete 10 audio lessons',
            iconUrl: '/icons/achievement-10.png',
            conditionType: AchievementConditionType.audio_count,
            conditionValue: 10,
        },
        {
            name: 'Streak Starter',
            description: 'Maintain a 3-day streak',
            iconUrl: '/icons/achievement-streak-3.png',
            conditionType: AchievementConditionType.streak,
            conditionValue: 3,
        },
        {
            name: 'Consistency is Key',
            description: 'Maintain a 7-day streak',
            iconUrl: '/icons/achievement-streak-7.png',
            conditionType: AchievementConditionType.streak,
            conditionValue: 7,
        },
        {
            name: 'Experience Builder',
            description: 'Reach 100 XP',
            iconUrl: '/icons/achievement-exp-100.png',
            conditionType: AchievementConditionType.exp,
            conditionValue: 100,
        },
        {
            name: 'Rising Star',
            description: 'Reach 500 XP',
            iconUrl: '/icons/achievement-exp-500.png',
            conditionType: AchievementConditionType.exp,
            conditionValue: 500,
        },
        {
            name: 'Listening Marathon',
            description: 'Listen for 1 hour total',
            iconUrl: '/icons/achievement-time-1h.png',
            conditionType: AchievementConditionType.listening_time,
            conditionValue: 3600, // 1 hour in seconds
        },
    ];

    const createdAchievements = [];
    for (const achievementData of achievementsData) {
        const achievement = await prisma.achievement.create({
            data: achievementData,
        });
        createdAchievements.push(achievement);
        console.log(`✅ Created achievement: ${achievement.name}`);
    }

    return createdAchievements;
}

export async function seedUserAchievements(userId: number, achievementIds: number[]) {
    console.log('🌱 Seeding user achievements...');

    // User unlocks first 2 achievements
    const userAchievementsData = achievementIds.slice(0, 2).map(achievementId => ({
        userId,
        achievementId,
        unlockAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
    }));

    const createdUserAchievements = [];
    for (const data of userAchievementsData) {
        const userAchievement = await prisma.userAchievement.create({
            data,
        });
        createdUserAchievements.push(userAchievement);
        console.log(`✅ User unlocked achievement ID: ${userAchievement.achievementId}`);
    }

    return createdUserAchievements;
}
