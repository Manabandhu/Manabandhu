export const ENV = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9090',
  authProvider: process.env.EXPO_PUBLIC_AUTH_PROVIDER || 'mock',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
};
