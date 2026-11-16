import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  // Automatic fallback for live Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://clientflow-j8qr.onrender.com/api';
  }
  return '/api';
};

const baseURL = getBaseURL();

const api = axios.create({
  baseURL,
  timeout: 30000, // 30-second timeout for Render cold starts
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic session expiration & unauthorized request handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
