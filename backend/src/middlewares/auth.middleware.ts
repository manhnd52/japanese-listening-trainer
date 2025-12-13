import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth'; 

export interface AuthRequest extends Request {
    userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("👉 [Middleware] Header nhận được:", authHeader); // Log 1
    console.log("👉 [Middleware] Token tách được:", token);      // Log 2

    if (!token) {
        res.status(401).json({ success: false, error: { message: 'Access token required' } });
        return; 
    }

    try {
        const decoded = verifyToken(token) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        // 🔥 QUAN TRỌNG: Log lỗi cụ thể ra terminal
        console.error("❌ [Middleware] Verify thất bại:", error); 
        res.status(403).json({ success: false, error: { message: 'Invalid or expired token' } });
    }
};