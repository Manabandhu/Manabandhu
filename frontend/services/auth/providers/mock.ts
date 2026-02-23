import { auth } from "../session";
import { tokenStorage } from "../token-storage";
import type { AuthUser } from "../types";

export async function signInWithMock(email: string): Promise<{ user: AuthUser }> {
  const user: AuthUser = {
    uid: email,
    email,
    displayName: email.split("@")[0],
  };

  await tokenStorage.setTokens(
    `mock-token-${Date.now()}`,
    `mock-refresh-${Date.now()}`
  );

  auth.setUser(user);
  return { user };
}
