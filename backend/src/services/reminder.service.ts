import { prisma } from '../prisma/index.js';
import { sendStreakReminderEmail } from './email.service.js';

export const processDailyReminders = async () => {
    console.log('⏰ [Cron] Starting daily reminder job...');
    const now = new Date();
    const VN_OFFSET = 7 * 60 * 60 * 1000; // Vietnam is UTC+7
    const vnTime = new Date(now.getTime() + VN_OFFSET);
    vnTime.setUTCHours(0, 0, 0, 0);
    const startOfTodayInUTC = new Date(vnTime.getTime() - VN_OFFSET);
    console.log(`[Cron] Querying activities from: ${startOfTodayInUTC.toISOString()} (VN Start of Day)`);
    try {
    const usersToRemind = await prisma.user.findMany({
        where: {
        userDailyActivities: {
            none: {
            date: {
                gte: startOfTodayInUTC, 
            },
            didListen: true,
            },
        },
        },
        select: {
        email: true,
        fullname: true,
        },
    });

    console.log(`found ${usersToRemind.length} users to remind.`);

    const promises = usersToRemind.map(user => 
        sendStreakReminderEmail(user.email, user.fullname)
    );

    await Promise.allSettled(promises);

    console.log('✅ [Cron] Daily reminder job finished.');
    } catch (error) {
    console.error('❌ [Cron] Error processing reminders:', error);
    }
};