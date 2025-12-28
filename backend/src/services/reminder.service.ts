import { prisma } from '../prisma/index.js';
import { sendStreakReminderEmail } from './email.service.js';

export const processDailyReminders = async () => {
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    const currentHour = vnTime.getUTCHours().toString().padStart(2, '0');
    const currentMinute = vnTime.getUTCMinutes().toString().padStart(2, '0');

    const timeString = `${currentHour}:${currentMinute}`;
    console.log(`Checking users scheduled for: ${timeString}`);

    const startOfTodayInUTC = new Date(vnTime.getTime() - 7 * 60 * 60 * 1000); 
    startOfTodayInUTC.setUTCHours(0, 0, 0, 0); // Reset về 0h sáng nay (theo giờ VN quy ra UTC)
    try {
    const usersToRemind = await prisma.user.findMany({
        where: {
            userSetting: {
                allowEmailNotification: true,
                reminderTimes: {
                has: timeString 
                }
            },
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