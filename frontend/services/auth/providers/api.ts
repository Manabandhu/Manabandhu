import { authApi } from "@/shared/api/auth";
import { auth } from "../session";
import { tokenStorage } from "../token-storage";
import type { AuthUser } from "../types";

export async function signInWithApi(
  email: string,
  password: string
): Promise<{ user: AuthUser }> {
  const response = await authApi.login({ email, password });
  const accessToken = response.accessToken || response.idToken;
  if (!accessToken) {
    throw new Error("Authentication response missing access token.");
  }

  await tokenStorage.setTokens(accessToken, response.refreshToken);

  const user: AuthUser = {
    uid: response.user?.authUserId || response.user?.id?.toString() || email,
    email,
    displayName: response.user?.name,
    photoURL: response.user?.photoUrl,
  };

  auth.setUser(user);
  return { user };
}
