import { prisma } from '../prisma/index.js';

export const streakService = async (userId: number) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    return await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: now,
      },
    });
  }

  const lastActiveDate = streak.lastActiveDate ? new Date(streak.lastActiveDate) : new Date(0);
  const lastDateToCheck = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());

  const diffTime = today.getTime() - lastDateToCheck.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return await prisma.streak.update({
      where: { userId },
      data: {
        lastActiveDate: now
    }
    });
  } else if (diffDays === 1) {
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.currentStreak + 1, streak.longestStreak),
        lastActiveDate: now,
      },
    });
  } else {
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastActiveDate: now,
      },
    });
  }
};