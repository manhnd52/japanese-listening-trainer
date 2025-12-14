import { prisma } from '../prisma';

export const updateStreak = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  let userStreak = await prisma.streak.findUnique({ where: { userId } });

  if (!userStreak) {
    return await prisma.streak.create({
      data: { userId, currentStreak: 1, lastActiveDate: new Date() },
    });
  }

  const lastActivity = new Date(userStreak.lastActivityAt);
  lastActivity.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return userStreak;
  } else if (diffDays === 1) {
    const newStreak = userStreak.currentStreak + 1;
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userStreak.longestStreak),
        lastActiveDate: new Date(),
      },
    });
  } else {
    return await prisma.streak.update({
      where: { userId },
      data: { currentStreak: 1, lastActiveDate: new Date() },
    });
  }
};