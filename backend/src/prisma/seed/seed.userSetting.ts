import { prisma } from '../index';

export async function seedUserSettings(userId: number) {
    console.log('🌱 Seeding user settings...');

    const userSetting = await prisma.userSetting.create({
        data: {
            userId,
            allowEmailNotification: true,
        },
    });

    console.log(`✅ Created user settings for user ${userId}`);
    return userSetting;
}
