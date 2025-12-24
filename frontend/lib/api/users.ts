import apiClient from './client';
import { toast } from '../toast';

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
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/api/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    try {
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!data.firebaseUid?.trim()) {
        throw new Error('Firebase UID is required');
      }
      
      const response = await apiClient.post('/api/users', data);
      toast.showSuccess('Profile created successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCurrentUser: async (data: CreateUserRequest): Promise<User> => {
    try {
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }
      
      const response = await apiClient.put('/api/users/me', data);
      toast.showSuccess('Profile updated successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
