const DEFAULT_API_BASE_URL = "http://localhost:9090";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
export const API_REQUEST_TIMEOUT_MS = 15000;
export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh";

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
