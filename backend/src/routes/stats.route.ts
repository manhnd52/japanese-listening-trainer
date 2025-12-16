import { Router } from 'express';
import { getStats } from '../controllers/stats.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStats);

export default router;