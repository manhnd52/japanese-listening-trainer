import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';

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
