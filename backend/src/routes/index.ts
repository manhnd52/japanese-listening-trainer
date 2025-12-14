import { Router } from 'express';
import userRoutes from './user.route';
import folderRoutes from './folder.route';
import audioRoutes from './audio.route';
import authRoutes from './auth.route';
// import statsRoutes from './stats.route';
const router = Router();

// Mount routes
// router.use('/stats', statsRoutes);
router.use('/users',  userRoutes);
router.use('/folders', folderRoutes);
router.use('/audios', audioRoutes);
router.use('/auth', authRoutes); // Auth routes can be under users or a separate route

export default router;
