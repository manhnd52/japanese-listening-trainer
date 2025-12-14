import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './user.route';
import folderRoutes from './folder.route';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/folders', folderRoutes);

export default router;
