import axios from 'axios';
import { toast } from '../../lib/toast';
import { tokenStorage, signOut } from '@/services/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9090';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

apiClient.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  const status = error.response?.status;

  if (status === 401 && !original?._retry) {
    original._retry = true;
    const refreshToken = await tokenStorage.getRefreshToken();

    if (refreshToken && !isRefreshing) {
      try {
        isRefreshing = true;
        const refreshedResp = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const refreshed = refreshedResp.data;
        const nextAccess = refreshed.accessToken || refreshed.idToken;
        if (nextAccess) {
          await tokenStorage.setTokens(nextAccess, refreshed.refreshToken || refreshToken);
          original.headers.Authorization = `Bearer ${nextAccess}`;
          return apiClient(original);
        }
      } catch {
        await signOut();
      } finally {
        isRefreshing = false;
      }
    }
    toast.showError('Please log in to continue', 'Authentication Required');
  }

  if (status && status >= 500) {
    toast.showError('Server error. Please try again later', 'Server Error');
  }

  return Promise.reject(error);
});

export default apiClient;
