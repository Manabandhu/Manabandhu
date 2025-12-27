import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationsAPI } from './api/notifications';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushTokenRegistration {
  token: string;
  deviceId?: string;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Request notification permissions and register push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the Expo push token
    // Only include projectId if it's a valid UUID format
    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    const isValidUUID = projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    
    let tokenData;
    if (isValidUUID) {
      tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
    } else {
      // In development/Expo Go, projectId is optional
      // For production builds, you should set EXPO_PUBLIC_EAS_PROJECT_ID
      tokenData = await Notifications.getExpoPushTokenAsync();
    }

    const token = tokenData.data;

    // Register token with backend
    await registerPushToken(token);

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    // Don't throw - gracefully handle missing projectId in development
    if (__DEV__) {
      console.warn('Push notifications require a valid EAS project ID in production. Set EXPO_PUBLIC_EAS_PROJECT_ID environment variable.');
    }
    return null;
  }
}

/**
 * Register push token with backend
 */
async function registerPushToken(token: string) {
  try {
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    
    await notificationsAPI.registerPushToken({
      token,
      platform,
    });
  } catch (error) {
    console.error('Error registering push token with backend:', error);
  }
}

/**
 * Unregister push token from backend
 */
export async function unregisterPushToken(token: string) {
  try {
    await notificationsAPI.unregisterPushToken(token);
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
}

/**
 * Get the current push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    // Only include projectId if it's a valid UUID format
    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    const isValidUUID = projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    
    let tokenData;
    if (isValidUUID) {
      tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
    } else {
      // In development/Expo Go, projectId is optional
      tokenData = await Notifications.getExpoPushTokenAsync();
    }
    
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Listener for when user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
    onNotificationTapped?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.requestPermissionsAsync();
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: Notifications.NotificationTriggerInput
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null, // null means show immediately
  });
}

