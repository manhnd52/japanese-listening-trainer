import axios from 'axios';

/**
 * Shared API client for all HTTP requests
 * Configured with base URL and interceptors
 */
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
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
        if (error.response?.status === 401) {
            console.warn('[API Interceptor] 401 Unauthorized - token may be invalid or expired');
        }

        if (!error.response) {
            // console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);

export async function fetchAudios() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseURL}/audios`);
  const json = await res.json();
  return json.data;
}


/**
 * Fetch random audios from user's own folders for Relax mode
 */
export async function fetchRandomAudiosFromMyList(userId: number, limit: number = 10) {
  const response = await apiClient.get(`/audios/random/my-list`, {
    params: { userId, limit }
  });
  return response.data.data;
}

/**
 * Fetch random audios from all public folders for Relax mode
 */
export async function fetchRandomAudiosFromCommunity(userId: number, limit: number = 10) {
  const response = await apiClient.get(`/audios/random/community`, {
    params: { userId, limit }
  });
  return response.data.data;
}

export default apiClient;