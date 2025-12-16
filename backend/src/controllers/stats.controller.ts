import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';
import { streakService } from '@services/streak.service.js';

export const checkStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updatedStreak = await streakService.updateStreak(userId);

    res.json({
      success: true,
      data: {
        streak: updatedStreak.currentStreak,
        lastActiveDate: updatedStreak.lastActiveDate
      }
    });
  } catch (error) {
    console.error('Check streak error:', error);
    res.status(500).json({ message: 'Failed to update streak' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; 

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
