import apiClient from './client';

export interface User {
  id: number;
  firebaseUid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  role?: string;
  photoUrl?: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  firebaseUid: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  role?: string;
  photoUrl?: string;
}

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  },

  updateCurrentUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.put('/api/users/me', data);
    return response.data;
  },
};
