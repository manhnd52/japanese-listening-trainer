import { HealthCheckResponse } from '../types/index.js';

class HealthService {
    getHealthStatus(): HealthCheckResponse {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
}

export const healthService = new HealthService();
