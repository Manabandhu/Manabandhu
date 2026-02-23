export type AuthProviderMode = "mock" | "api";

export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}
