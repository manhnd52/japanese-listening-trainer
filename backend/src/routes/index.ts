import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './user.route';
import audioRoutes from './audio.route'
import authRoute from './auth.route';
import statsRoutes from './stats.route';
const router = Router();

// Mount routes
router.use('/stats', statsRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes)
router.use('/audios',audioRoutes)
router.use('/auth', authRoute);
export default router;
