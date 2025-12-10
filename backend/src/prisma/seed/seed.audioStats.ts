import { prisma } from '../index';

export async function seedAudioStats(userId: number, audioIds: number[]) {
    console.log('🌱 Seeding audio stats...');

    const audioStatsData = [];

    // Create stats for some audios (not all)
    for (let i = 0; i < Math.min(5, audioIds.length); i++) {
        const audioId = audioIds[i];
        const isFavorite = Math.random() > 0.5;
        const listenCount = Math.floor(Math.random() * 10) + 1;

        audioStatsData.push({
            userId,
            audioId,
            isFavorite,
            listenCount,
            firstListenDone: true,
            lastListenTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        });
    }

    const createdStats = [];
    for (const statsData of audioStatsData) {
        const stats = await prisma.audioStats.create({
            data: statsData,
        });
        createdStats.push(stats);
        console.log(`✅ Created audio stats for audioId: ${stats.audioId} (${stats.isFavorite ? '❤️ ' : ''}${stats.listenCount} listens)`);
    }

    return createdStats;
}
