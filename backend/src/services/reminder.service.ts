import { prisma } from '../prisma/index.js';
import { sendStreakReminderEmail } from './email.service.js';

export const processDailyReminders = async () => {
  console.log('⏰ [Cron] Starting daily reminder job...');
  
  const today = new Date();``
  today.setHours(0, 0, 0, 0);

  try {
    const usersToRemind = await prisma.user.findMany({
      where: {
        userDailyActivities: {
          none: {
            date: {
              gte: today, 
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