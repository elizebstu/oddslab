import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle wrapped API responses - extract data from { success: true, data: ... }
api.interceptors.response.use(
  (response) => {
    // If response has success and data properties, return the data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success && 'data' in response.data) {
        response.data = response.data.data;
      } else if (!response.data.success && 'error' in response.data) {
        // Error response - throw it
        throw { response: { data: response.data } };
      }
    }
    return response;
  },
  (error) => {
    // Already an error, just propagate
    return Promise.reject(error);
  }
);

export default api;
