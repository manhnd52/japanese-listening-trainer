import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    nodeEnv: string;
    port: number;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    corsOrigin: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const config: EnvConfig = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '5000'), 10),
    databaseUrl: getEnvVar('DATABASE_URL'),
    jwtSecret: getEnvVar('JWT_SECRET'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
    corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
};
