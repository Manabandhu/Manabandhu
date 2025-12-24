import axios from 'axios';
import { auth } from '../firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      timeout: error.code === 'ECONNABORTED'
    });
    
    if (error.response?.status === 401) {
      console.error('Unauthorized - please login again');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
