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

export interface HealthCheckResponse {
    status: string;
    uptime: number;
    timestamp: string;
}
