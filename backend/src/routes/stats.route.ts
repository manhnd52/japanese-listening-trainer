import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getStats);

export default router;