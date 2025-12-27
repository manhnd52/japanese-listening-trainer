import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service.js';

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getCurrentUser = this.getCurrentUser.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
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
            return next(error);
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
            const userWithSettings = await authService.getUserById(result.user.id);

            // ✅ Map lại response cho đúng format
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: result.user.id.toString(),
                        email: result.user.email,
                        name: result.user.fullname, // fullname -> name
                        // ✅ Xóa role - không tồn tại trong schema
                        settings: userWithSettings?.userSetting ? {
                             allowEmailNotification: userWithSettings.userSetting.allowEmailNotification,
                             reminderTimes: userWithSettings.userSetting.reminderTimes
                        } : null
                    },
                    token: result.accessToken, // accessToken -> token
                    refreshToken: result.refreshToken,
                },
                message: 'Login successfully'
            });
        } catch (error: any) {
            return next(error);
        }
    }

    /**
     * @route GET /api/auth/me
     * @desc Get current authenticated user
     */
    async getCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            // userId is attached by authenticateToken middleware
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        message: 'User not authenticated'
                    }
                });
                return;
            }

            const user = await authService.getUserById(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'User not found'
                    }
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.fullname,
                    avatarUrl: user.avatarUrl || '',
                    settings: user.userSetting ? {
                        allowEmailNotification: user.userSetting.allowEmailNotification,
                        reminderTimes: user.userSetting.reminderTimes
                    } : null
                }
            });
        } catch (error: any) {
            return next(error);
        }
    }
    /**
     * @route PUT /api/auth/settings (Hàm mới)
     */
    async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                return;
            }

            const { allowEmailNotification, reminderTimes } = req.body;

            const updatedSettings = await authService.updateSettings(userId, {
                allowEmailNotification,
                reminderTimes
            });

            res.status(200).json({
                success: true,
                data: updatedSettings,
                message: 'Settings updated successfully'
            });
        } catch (error: any) {
            return next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction){
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Unauthorized' }
                });
                return; 
            }
            const { email, fullname, newPassword } = req.body;
            const updatedUser = await authService.updateProfile({ userId, email, fullname, newPassword });

            res.status(200).json({
                success: true,
                data: {
                    id: updatedUser.id.toString(),
                    email: updatedUser.email,
                    name: updatedUser.fullname,
                    avatarUrl: updatedUser.avatarUrl || ''
                },
                message: 'Profile updated successfully'
            });
            return;
        } catch (error: any) {
            return next(error);

        }
    }
}

export default new AuthController();