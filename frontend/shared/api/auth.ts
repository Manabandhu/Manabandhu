import apiClient from './client';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  idToken: string;
  user: any;
  message?: string;
}

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  },

  verifyToken: async (idToken: string): Promise<{ valid: boolean; user?: any }> => {
    const response = await apiClient.post('/api/auth/verify-token', { idToken });
    return response.data;
  },
};
