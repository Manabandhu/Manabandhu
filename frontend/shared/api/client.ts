import axios from 'axios';
import { auth } from '../firebase';
import { toast } from '../toast';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9090';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    switch (status) {
      case 400:
        if (error.response?.data?.fieldErrors) {
          const fieldMessages = Object.values(error.response.data.fieldErrors).join('\n');
          toast.showError(fieldMessages, 'Validation Error');
        } else {
          toast.showError(message || 'Invalid request');
        }
        break;
      case 401:
        toast.showError('Please log in to continue', 'Authentication Required');
        break;
      case 403:
        toast.showError('You don\'t have permission to perform this action', 'Access Denied');
        break;
      case 404:
        toast.showError('The requested resource was not found', 'Not Found');
        break;
      case 409:
        toast.showError(message || 'This action conflicts with existing data', 'Conflict');
        break;
      case 500:
        toast.showError('Server error. Please try again later', 'Server Error');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.showError('Request timeout. Please try again.', 'Timeout');
        } else if (error.code === 'NETWORK_ERROR') {
          toast.showError('Network error. Please check your connection.', 'Network Error');
        } else {
          toast.showError(message || 'An unexpected error occurred');
        }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
