import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async (): Promise<void> => {
    try {
        const server = app.listen(config.port, () => {
            logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
            logger.info(`Health check available at http://localhost:${config.port}/api/health`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);
            server.close(() => {
                logger.info('Server closed. Process terminating...');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
