import { Router } from 'express';
import healthRoutes from './health.route';
import userRoutes from './user.route';
import folderRoutes from './folder.route';
import audioRoutes from './audio.route';

import authRoute from './auth.route';
const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/folders', folderRoutes);
router.use('/audios', audioRoutes);
router.use('/auth', authRoute);

export default router;
