import { secureStorage } from "@/lib/storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  getAccessToken: () => secureStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => secureStorage.getItem(REFRESH_TOKEN_KEY),
  async setTokens(accessToken: string, refreshToken?: string) {
    await secureStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  async clear() {
    await secureStorage.removeItem(ACCESS_TOKEN_KEY);
    await secureStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export async function getAuthToken(): Promise<string | undefined> {
  return (await tokenStorage.getAccessToken()) || undefined;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
