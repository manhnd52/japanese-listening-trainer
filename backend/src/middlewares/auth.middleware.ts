import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { errorResponse } from '../utils/response';

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            errorResponse(res, 'Access token is required', 401);
            return;
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Attach userId to request object
        req.userId = decoded.userId;
        
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            errorResponse(res, 'Token has expired', 401);
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            errorResponse(res, 'Invalid token', 401);
        }
        errorResponse(res, 'Authentication failed', 401);
        return;
    }
};

// Optional: middleware for routes that can work with or without auth
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without userId
        next();
    }
};