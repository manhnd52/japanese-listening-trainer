import axios from 'axios';

/**
 * Shared API client for all HTTP requests
 * Configured with base URL and interceptors
 */
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000, // Increase timeout to 30s
    // Force rebuild to apply new env variables
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage (if using JWT)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            console.log('[API Interceptor] Token:', token ? 'exists' : 'null');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API Interceptor] Added Authorization header');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - DON'T auto-clear token, just log
        if (error.response?.status === 401) {
            console.warn('[API Interceptor] 401 Unauthorized - token may be invalid or expired');
            // Don't clear token here - let the auth flow handle it
            // This was causing issues with quiz submission
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);

export async function fetchAudios() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseURL}/audios`);
  const json = await res.json();
  return json.data; // trả về mảng audio
}

