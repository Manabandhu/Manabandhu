import * as Location from "expo-location";
import Constants from "expo-constants";

// Check if running in Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Conditionally import expo-notifications to avoid errors in Expo Go
let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  try {
    // Use dynamic require to avoid import errors in Expo Go
    Notifications = require("expo-notifications") as typeof import("expo-notifications");
  } catch (error) {
    // Notifications not available
    if (__DEV__) {
      console.warn('expo-notifications not available:', error);
    }
  }
}

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  // Skip notification permission request in Expo Go
  if (isExpoGo || !Notifications) {
    if (__DEV__) {
      console.log('Notification permissions are not fully supported in Expo Go. Use a development build for full functionality.');
    }
    return false;
  }
  
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    return false;
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    return false;
  }
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  // Skip notification permission check in Expo Go
  if (isExpoGo || !Notifications) {
    return false;
  }
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    return false;
  }
};



