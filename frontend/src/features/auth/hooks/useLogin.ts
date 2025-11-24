'use client';

import { useState } from 'react';
import { LoginCredentials, AuthResponse } from '../types';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            // Mock API call - replace with actual API endpoint
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock successful response
            const mockResponse: AuthResponse = {
                user: {
                    id: '1',
                    name: 'John Doe',
                    email: credentials.email,
                },
                token: 'mock-jwt-token',
            };

            console.log('Login successful:', mockResponse);
            // TODO: Store token, update global state, redirect
            return mockResponse;
        } catch (err) {
            const errorMessage = 'Login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
};
