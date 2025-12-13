// src/routes/auth.route.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;