import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    timestamp: string;
}

export const successResponse = <T>(
    res: Response,
    data: T,
    statusCode: number = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
};

export const errorResponse = (
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
): Response => {
    const response: ApiResponse = {
        success: false,
        error: {
            message,
            code,
            details,
        },
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
};
