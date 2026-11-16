import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
const cleanURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = cleanURL.endsWith('/api') ? cleanURL : (cleanURL ? `${cleanURL}/api` : '/api');

const api = axios.create({
  baseURL,
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
