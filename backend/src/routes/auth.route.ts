// src/routes/auth.route.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

export default router;