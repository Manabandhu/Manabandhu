import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Web-compatible storage fallback
const webStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};

/**
 * Platform-agnostic secure storage utility
 * Uses SecureStore on native platforms and localStorage on web
 */
export const secureStorage = {
  /**
   * Get an item from secure storage
   */
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return webStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },

  /**
   * Set an item in secure storage
   */
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      webStorage.setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },

  /**
   * Remove an item from secure storage
   */
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      webStorage.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};

