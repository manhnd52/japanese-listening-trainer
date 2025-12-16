import { Request, Response } from 'express';
import { successResponse } from '../utils/response.js';
import { healthService } from '../services/health.service.js';

export const healthController = {
    check: async (req: Request, res: Response): Promise<void> => {
        const healthData = healthService.getHealthStatus();
        successResponse(res, healthData, 200);
    },
};
