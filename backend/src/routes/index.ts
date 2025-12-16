import { Router } from 'express';
import folderRoutes from './folder.route.js';
import audioRoutes from './audio.route.js';
import sharringRoutes from './sharing.route.js';
import statsRoutes from './stats.route.js';
import authRoutes from './auth.route.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Mount routes
router.use('/stats', statsRoutes);
router.use('/folders', sharringRoutes);
router.use('/folders', authenticateToken, folderRoutes);
router.use('/audios', authenticateToken, audioRoutes);
router.use('/auth', authRoutes);

export default router;
