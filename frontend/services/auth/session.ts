import type { AuthUser } from "./types";

type AuthListener = (user: AuthUser | null) => void;

class AuthSession {
  currentUser: AuthUser | null = null;
  private listeners = new Set<AuthListener>();

  subscribe(listener: AuthListener) {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setUser(user: AuthUser | null) {
    this.currentUser = user;
    this.listeners.forEach((listener) => listener(user));
  }
}

export const auth = new AuthSession();
