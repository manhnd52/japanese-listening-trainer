import cron from 'node-cron';
import { processDailyReminders } from '../services/reminder.service.js';

export const initCronJobs = () => {
  cron.schedule('45 11 * * *', async () => {
    await processDailyReminders();
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  console.log('✅ Cron jobs initialized (Schedule: 20:00 Daily)');
};