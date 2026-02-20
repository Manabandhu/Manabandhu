import apiClient from './client';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user: any;
  message?: string;
}

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  },
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },
  verifyToken: async (_idToken: string): Promise<{ valid: boolean; user?: any }> => {
    const response = await apiClient.get('/api/users/me');
    return { valid: true, user: response.data };
  },
};
