// src/routes/auth.route.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);

// Route: GET /api/auth/me - Get current user from token
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;