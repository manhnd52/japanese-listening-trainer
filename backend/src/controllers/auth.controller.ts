import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

class AuthController {
    /**
     * @route POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullname, email, password } = req.body;

            // Basic validation (Nên dùng thư viện như Joi/Zod ở bước nâng cao)
            if (!fullname || !email || !password) {
                 res.status(400).json({
                    success: false,
                    error: {
                        message: 'Missing required fields: fullname, email, password'
                    }
                });
                return;
            }

            const newUser = await authService.register({
                fullname,
                email,
                password
            });

            res.status(201).json({
                success: true,
                data: newUser,
                message: 'User registered successfully'
            });
        } catch (error: any) {
            // Chuyển lỗi xuống middleware xử lý lỗi chung (src/middlewares/errorHandler.ts)
            next(error);
        }
    }

    /**
     * @route POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                 res.status(400).json({
                    success: false,
                    error: {
                        message: 'Please provide email and password'
                    }
                });
                return;
            }

            const result = await authService.login({ email, password });

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successfully'
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * @route GET /api/auth/me
     */
    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            if (!userId) throw new Error('User ID missing');

            const user = await authService.getMe(userId);

            res.status(200).json({
                success: true,
                data: {          
                    user: user  
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route PUT /api/auth/profile
     */
    async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { fullname, newPassword } = req.body;

            if (!userId) throw new Error('User ID missing');

            const updatedUser = await authService.updateProfile({
                userId,
                fullname,
                newPassword
            });

            res.status(200).json({
                success: true,
                data: updatedUser,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();