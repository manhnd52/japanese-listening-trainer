import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT) || config.port || 5000;

    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${port}`);

      if (config.nodeEnv !== 'production') {
        logger.info(`Health check: http://localhost:${port}/api/health`);
      }
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
