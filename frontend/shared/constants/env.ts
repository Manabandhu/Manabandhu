import { API_BASE_URL } from "./network";

export const ENV = {
  apiUrl: API_BASE_URL,
  authProvider: process.env.EXPO_PUBLIC_AUTH_PROVIDER || 'mock',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
};
