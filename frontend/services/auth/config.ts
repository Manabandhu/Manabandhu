import type { AuthProviderMode } from "./types";

export const AUTH_PROVIDER =
  (process.env.EXPO_PUBLIC_AUTH_PROVIDER as AuthProviderMode) || "mock";
