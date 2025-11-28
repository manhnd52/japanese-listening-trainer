import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error(`${err.name}: ${err.message}`, {
            statusCode: err.statusCode,
            code: err.code,
            path: req.path,
            method: req.method,
        });

        errorResponse(res, err.message, err.statusCode, err.code, err.details);
    } else {
        logger.error(`Unhandled Error: ${err.message}`, {
            stack: err.stack,
            path: req.path,
            method: req.method,
        });

        errorResponse(
            res,
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
            500,
            'INTERNAL_ERROR'
        );
    }
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
};
