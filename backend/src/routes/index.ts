import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './user.route';
import audioRoutes from './audio.route'
const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/users', userRoutes)
router.use('/audios',audioRoutes)
export default router;
