import { Router } from 'express';
import { getStats, checkStreak } from '../controllers/stats.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStats);
router.post('/streak', authenticateToken, checkStreak);

export default router;