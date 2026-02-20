import { secureStorage } from "@/lib/storage";
import { authApi } from "@/shared/api/auth";

export type AuthProviderMode = "mock" | "api";
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

const AUTH_PROVIDER = (process.env.EXPO_PUBLIC_AUTH_PROVIDER as AuthProviderMode) || "mock";

class AuthSession {
  currentUser: AuthUser | null = null;
  private listeners = new Set<(u: AuthUser | null) => void>();

  subscribe(listener: (u: AuthUser | null) => void) {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  setUser(user: AuthUser | null) {
    this.currentUser = user;
    this.listeners.forEach((l) => l(user));
  }
}

export const auth = new AuthSession();

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  getAccessToken: () => secureStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => secureStorage.getItem(REFRESH_TOKEN_KEY),
  async setTokens(accessToken: string, refreshToken?: string) {
    await secureStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clear() {
    await secureStorage.removeItem(ACCESS_TOKEN_KEY);
    await secureStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const signInWithEmail = async (email: string, _password: string) => {
  if (AUTH_PROVIDER === "api") {
    const response = await authApi.login({ email, password: _password });
    await tokenStorage.setTokens(response.accessToken || response.idToken, response.refreshToken);
    const user: AuthUser = {
      uid: response.user?.authUserId || response.user?.id?.toString() || email,
      email,
      displayName: response.user?.name,
      photoURL: response.user?.photoUrl,
    };
    auth.setUser(user);
    return { user };
  }

  const user: AuthUser = { uid: email, email, displayName: email.split("@")[0] };
  await tokenStorage.setTokens(`mock-token-${Date.now()}`, `mock-refresh-${Date.now()}`);
  auth.setUser(user);
  return { user };
};

export const signUpWithEmail = signInWithEmail;
export const signInWithGoogle = async () => { throw new Error("Google login is not enabled."); };
export const signInWithApple = async () => { throw new Error("Apple login is not enabled."); };
export const sendOTP = async (_phoneNumber: string) => "000000";
export const verifyOTP = async (_verificationId: string, _code: string) => ({ user: auth.currentUser });
export const resetPassword = async (_email: string) => true;
export const confirmPasswordReset = async (_code: string, _newPassword: string) => true;

export const signOut = async () => {
  await tokenStorage.clear();
  auth.setUser(null);
};

export const initializeSession = async () => {
  const token = await tokenStorage.getAccessToken();
  if (!token) {
    auth.setUser(null);
  }
};

export const getCurrentUser = () => auth.currentUser;
