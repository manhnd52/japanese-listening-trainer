import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    /**
     * @route POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullname, email, password } = req.body;

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
                data: {
                    user: {
                        id: newUser.id.toString(),
                        email: newUser.email,
                        name: newUser.fullname,
                        // ✅ Xóa role - không tồn tại trong schema
                    }
                },
                message: 'User registered successfully'
            });
        } catch (error: any) {
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

            // ✅ Map lại response cho đúng format
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: result.user.id.toString(),
                        email: result.user.email,
                        name: result.user.fullname, // fullname -> name
                        // ✅ Xóa role - không tồn tại trong schema
                    },
                    token: result.accessToken, // accessToken -> token
                    refreshToken: result.refreshToken,
                },
                message: 'Login successfully'
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new AuthController();