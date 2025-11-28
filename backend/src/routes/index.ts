import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './user.route';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/users', userRoutes)

export default router;
