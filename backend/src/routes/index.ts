import { Router } from 'express';
import userRoutes from './user.route';
import folderRoutes from './folder.route';
import audioRoutes from './audio.route';
import authRoutes from './auth.route';
import { authenticateToken } from '@middlewares/auth.middleware';
// import statsRoutes from './stats.route';
const router = Router();

// Mount routes
// router.use('/stats', statsRoutes);
router.use('/users', authenticateToken, userRoutes);
router.use('/folders', authenticateToken, folderRoutes);
router.use('/audios', authenticateToken, audioRoutes);
router.use('/auth', authRoutes); // Auth routes can be under users or a separate route

export default router;
