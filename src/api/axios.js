import axios from 'axios';

const api = axios.create({
  // Jika VITE_API_URL tidak ada, dia akan menggunakan '/api/v1' secara relatif
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;