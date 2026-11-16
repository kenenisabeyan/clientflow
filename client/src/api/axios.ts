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

export default api;
