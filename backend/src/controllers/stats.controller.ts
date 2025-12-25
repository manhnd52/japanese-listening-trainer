import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';
import { streakService } from '../services/streak.service.js';
import { xpService } from '../services/xp.service.js';

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const checkStreak = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const updatedStreak = await streakService(userId);

    if (!updatedStreak) {
        throw new Error('Could not update streak');
    }

    const xpResult = await xpService.addXP(userId, 10);

    return res.json({
      success: true,
      data: {
        streak: updatedStreak.currentStreak,
        lastActiveDate: updatedStreak.lastActiveDate,
        xp: xpResult
      }
    });
  } catch (error) {
    console.error('Check streak error:', error);
    return res.status(500).json({ message: 'Failed to update streak' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    const data = await statsService.getDashboardStats(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve statistics' },
    });
  }
};
