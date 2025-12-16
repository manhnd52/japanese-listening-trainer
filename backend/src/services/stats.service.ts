import { startOfWeek, endOfWeek, subDays, format, getDay } from 'date-fns';
import { prisma } from '../prisma/index.js';

export const statsService = {
  getDashboardStats: async (userId: number) => {
    // a. Streak (Chuỗi ngày liên tiếp)
    const streakRecord = await prisma.streak.findUnique({
      where: { userId }
    });
    const currentStreak = streakRecord?.currentStreak || 0;
    // b. Total Listened (Tổng số bài đã nghe - dựa trên lượt nghe)
    const audioStatsAgg = await prisma.audioStats.aggregate({
      where: { userId },
      _sum: { listenCount: true }
    });
    const totalListened = audioStatsAgg._sum.listenCount || 0;
    // c. Total Time (Tổng thời gian nghe - tính bằng phút)
    // Bảng UserDailyActivity lưu giây (seconds) -> chia 60 ra phút
    const dailyActivityAgg = await prisma.userDailyActivity.aggregate({
      where: { userId },
      _sum: { totalListenTime: true }
    });
    const totalTimeMinutes = Math.floor((dailyActivityAgg._sum.totalListenTime || 0) / 60);
    // d. Level & EXP
    const userExpRecord = await prisma.userExp.findUnique({
      where: { userId }
    });
    const exp = userExpRecord?.exp || 0;
    // Giả định công thức: Level = 1 + (Exp / 1000)
    const level = Math.floor(exp / 1000) + 1;
    // e. Quiz Stats (Độ chính xác)
    const totalQuizAttempts = await prisma.quizAttemptLog.count({
      where: { userId }
    });
    const correctQuizAttempts = await prisma.quizAttemptLog.count({
      where: { userId, isCorrect: true }
    });
    const quizAccuracy = totalQuizAttempts > 0 
      ? Math.round((correctQuizAttempts / totalQuizAttempts) * 100) 
      : 0;
    // --- 2. LẤY DỮ LIỆU BIỂU ĐỒ CỘT (ACTIVITY - 7 NGÀY CỦA TUẦN HIỆN TẠI) ---
    const today = new Date();
    // Lưu ý: Tuần bắt đầu từ Thứ 2 (weekStartsOn: 1)
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

    const weeklyActivities = await prisma.userDailyActivity.findMany({
      where: {
        userId,
        date: {
          gte: startOfThisWeek,
          lte: endOfThisWeek
        }
      }
    });

    // Tạo mảng chuẩn 7 ngày (Mon -> Sun)
    const daysMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activity = daysMap.map((dayLabel, index) => {
      // Tìm record trong DB ứng với thứ trong tuần
      const record = weeklyActivities.find(act => {
        // getDay(): 0 là Sun, 1 là Mon... -> Convert về index: 0 là Mon ... 6 là Sun
        const dayIndex = getDay(act.date) === 0 ? 6 : getDay(act.date) - 1;
        return dayIndex === index;
      });

      // totalListenTime đang là giây -> đổi sang phút để vẽ biểu đồ
      return { 
        day: dayLabel, 
        value: record ? Math.floor(record.totalListenTime / 60) : 0 
      };
    });

    // --- 3. LẤY DỮ LIỆU HEATMAP (90 NGÀY GẦN NHẤT) ---
    const threeMonthsAgo = subDays(today, 90);
    const pastActivities = await prisma.userDailyActivity.findMany({
      where: {
        userId,
        date: { gte: threeMonthsAgo }
      },
      select: { date: true, totalListenTime: true }
    });

    const heatmap = pastActivities.map(act => {
      const minutes = Math.floor(act.totalListenTime / 60);
      
      // Logic phân cấp độ màu (0-4) cho Frontend hiển thị độ đậm nhạt
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (minutes >= 60) level = 4;       // > 60 phút (Đậm nhất)
      else if (minutes >= 30) level = 3;  // > 30 phút
      else if (minutes >= 15) level = 2;  // > 15 phút
      else if (minutes > 0) level = 1;    // Có nghe

      return {
        date: format(act.date, 'yyyy-MM-dd'),
        level
      };
    });

    // --- 4. TRẢ VỀ KẾT QUẢ KHỚP VỚI FRONTEND ---
    return {
      streak: currentStreak,
      totalListened,
      totalTime: totalTimeMinutes,
      level,
      exp,
      quizAccuracy,
      totalCorrectQuizzes: correctQuizAttempts,
      
      // Dữ liệu cho biểu đồ
      activity, 
      heatmap,
      quizStats: {
        correct: quizAccuracy,
        wrong: 100 - quizAccuracy,
        totalCorrect: correctQuizAttempts,
        totalWrong: totalQuizAttempts - correctQuizAttempts
      }
    };
  }
};