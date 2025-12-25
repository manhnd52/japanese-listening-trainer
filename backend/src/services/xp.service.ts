import { prisma } from '../prisma/index.js';

const XP_PER_LEVEL = 100;

export const xpService = {
    getLevel: (totalExp: number) => Math.floor(totalExp / XP_PER_LEVEL) + 1,
    addXP: async (userId: number, amount: number) => {
    let userExp = await prisma.userExp.findUnique({
      where: { userId },
    });

    if (!userExp) {
      userExp = await prisma.userExp.create({
        data: { userId, exp: 0 },
      });
    }

    const currentExp = userExp.exp;
    const oldLevel = Math.floor(currentExp / XP_PER_LEVEL) + 1;

    const newExp = currentExp + amount;
    const updatedRecord = await prisma.userExp.update({
      where: { userId },
      data: { exp: newExp },
    });

    const newLevel = Math.floor(newExp / XP_PER_LEVEL) + 1;
    const isLevelUp = newLevel > oldLevel;

    return {
      totalExp: newExp,
      level: newLevel,
      xpGained: amount,
      isLevelUp,
      currentLevelExp: newExp % XP_PER_LEVEL, 
      nextLevelExp: XP_PER_LEVEL 
    };
  }
}