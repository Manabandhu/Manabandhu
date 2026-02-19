import apiClient from './client';
import { getAuthToken } from './auth-token';

export interface PushTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  types?: string[];
}

class NotificationsAPI {
  private async getAuthHeaders() {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Register a push token for the current user
   */
  async registerPushToken(request: PushTokenRequest): Promise<void> {
    await apiClient.post('/api/notifications/push-tokens', request, {
      headers: await this.getAuthHeaders(),
    });
  }

  /**
   * Update push token (e.g., when token refreshes)
   */
  async updatePushToken(token: string, request: PushTokenRequest): Promise<void> {
    await apiClient.put(`/api/notifications/push-tokens/${encodeURIComponent(token)}`, request, {
      headers: await this.getAuthHeaders(),
    });
  }

  /**
   * Unregister a push token
   */
  async unregisterPushToken(token: string): Promise<void> {
    await apiClient.delete(`/api/notifications/push-tokens/${encodeURIComponent(token)}`, {
      headers: await this.getAuthHeaders(),
    });
  }

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get('/api/notifications/preferences', {
      headers: await this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    await apiClient.put('/api/notifications/preferences', preferences, {
      headers: await this.getAuthHeaders(),
    });
  }

  /**
   * Get user's notification history
   */
  async getNotificationHistory(page = 0, size = 20) {
    const response = await apiClient.get(`/api/notifications/history?page=${page}&size=${size}`, {
      headers: await this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/api/notifications/${notificationId}/read`, {}, {
      headers: await this.getAuthHeaders(),
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/notifications/read-all', {}, {
      headers: await this.getAuthHeaders(),
    });
  }
}

export const notificationsAPI = new NotificationsAPI();

