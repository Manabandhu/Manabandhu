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
  currency?: string;
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
  currency?: string;
}

// Simple in-memory cache for getAllUsers to avoid repeated API calls
// Cache expires after 5 minutes (300000ms)
const usersCache: { data: User[] | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (forceRefresh = false): Promise<User[]> => {
    try {
      const now = Date.now();
      
      // Return cached data if it's still valid and not forcing refresh
      if (!forceRefresh && usersCache.data && (now - usersCache.timestamp) < CACHE_TTL) {
        return usersCache.data;
      }
      
      // Fetch fresh data
      const response = await apiClient.get('/api/users');
      usersCache.data = response.data;
      usersCache.timestamp = now;
      return response.data;
    } catch (error) {
      // If cache exists and request fails, return stale cache as fallback
      if (usersCache.data) {
        console.warn('Failed to fetch users, returning cached data', error);
        return usersCache.data;
      }
      throw error;
    }
  },

  // Clear the cache (useful when user data is updated)
  clearUsersCache: () => {
    usersCache.data = null;
    usersCache.timestamp = 0;
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
      // Clear cache when user updates their profile
      userApi.clearUsersCache();
      toast.showSuccess('Profile updated successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
