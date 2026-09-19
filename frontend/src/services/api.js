import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'https://ffj-tree-aadhar-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ffj_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('ffj_admin_token');
      localStorage.removeItem('ffj_admin_user');
    }
    return Promise.reject(error);
  }
);

export default api;
