import axios from 'axios';
import { toast } from '../../lib/toast';
import { tokenStorage } from '@/services/auth';
import { API_ERROR_MESSAGES } from '@/shared/constants/messages';
import {
  API_BASE_URL,
  API_REQUEST_TIMEOUT_MS,
  AUTH_REFRESH_ENDPOINT,
} from '@/shared/constants/network';
import { buildApiUrl } from '@/shared/utils/url';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
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
        const refreshedResp = await axios.post(buildApiUrl(AUTH_REFRESH_ENDPOINT), { refreshToken });
        const refreshed = refreshedResp.data;
        const nextAccess = refreshed.accessToken || refreshed.idToken;
        if (nextAccess) {
          await tokenStorage.setTokens(nextAccess, refreshed.refreshToken || refreshToken);
          original.headers.Authorization = `Bearer ${nextAccess}`;
          return apiClient(original);
        }
      } catch {
        const { signOut } = await import('@/services/auth');
        await signOut();
      } finally {
        isRefreshing = false;
      }
    }
    toast.showError(
      API_ERROR_MESSAGES.authRequiredBody,
      API_ERROR_MESSAGES.authRequiredTitle
    );
  }

  if (status && status >= 500) {
    toast.showError(
      API_ERROR_MESSAGES.serverErrorBody,
      API_ERROR_MESSAGES.serverErrorTitle
    );
  }

  return Promise.reject(error);
});

export default apiClient;
