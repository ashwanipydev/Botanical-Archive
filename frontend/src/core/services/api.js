import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.42:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor with request logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zoo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Detailed Request Logging
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Payload:', config.data);
    }
    if (config.params) {
      console.log('Params:', config.params);
    }
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with detailed logging and 401 handling
api.interceptors.response.use(
  (response) => {
    console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    console.group(`❌ API Error: ${method} ${url}`);
    console.error('Status:', status);
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Response Data:', error.response.data);
    }
    console.groupEnd();

    if (status === 401) {
      console.warn('⚠️ Session expired or invalid. Redirecting to login...');
      localStorage.removeItem('zoo_token');
      localStorage.removeItem('zoo_user');
      // Only redirect if not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
