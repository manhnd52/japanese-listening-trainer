import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    nodeEnv: string;
    port: number;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    corsOrigin: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
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
    corsOrigin: getEnvVar('CORS_ORIGIN', 'https://jltedu.io.vn'),
    smtpHost: getEnvVar('SMTP_HOST'),
    smtpPort: parseInt(getEnvVar('SMTP_PORT', '587'), 10),
    smtpUser: getEnvVar('SMTP_USER'),
    smtpPass: getEnvVar('SMTP_PASS'),
    smtpFrom: getEnvVar('SMTP_FROM', 'JLT Support <no-reply@jltapp.com>'),
};
