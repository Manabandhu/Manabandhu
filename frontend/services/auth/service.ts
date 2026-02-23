import { AUTH_PROVIDER } from "./config";
import { signInWithApi } from "./providers/api";
import { signInWithMock } from "./providers/mock";
import { auth } from "./session";
import { tokenStorage } from "./token-storage";

export const signInWithEmail = async (email: string, password: string) => {
  if (AUTH_PROVIDER === "api") {
    return signInWithApi(email, password);
  }
  return signInWithMock(email);
};

export const signUpWithEmail = signInWithEmail;

export const signInWithGoogle = async () => {
  throw new Error("Google login is not enabled.");
};

export const signInWithApple = async () => {
  throw new Error("Apple login is not enabled.");
};

export const sendOTP = async (_phoneNumber: string) => "000000";

export const verifyOTP = async (_verificationId: string, _code: string) => ({
  user: auth.currentUser,
});

export const resetPassword = async (_email: string) => true;

export const confirmPasswordReset = async (_code: string, _newPassword: string) =>
  true;

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
