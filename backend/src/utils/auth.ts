import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';

// --- Password Handling ---
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

// --- Token Handling ---
export const generateAccessToken = (userId: number): string => {
    const options: SignOptions = { expiresIn: '1h' };
    return jwt.sign({ userId }, config.jwtSecret, options);
};

export const generateRefreshToken = (userId: number): string => {
    const options: SignOptions = { 
        expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] 
    };
    return jwt.sign({ userId }, config.jwtSecret, options);
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, config.jwtSecret);
};