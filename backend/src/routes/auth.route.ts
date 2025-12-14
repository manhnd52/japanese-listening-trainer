// src/routes/auth.route.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

// Route: GET /api/auth/me - Get current user from token
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;