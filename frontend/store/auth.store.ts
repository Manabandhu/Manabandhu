import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/shared/types";
import { auth, initializeSession, signOut as authSignOut } from "@/services/auth";
import { userApi } from "@/shared/api";
import { secureStorage } from "@/lib/storage";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  unsubscribe: (() => void) | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  initializeAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      onboardingCompleted: false,
      unsubscribe: null,
      setUser: (user) => set({ user, isAuthenticated: !!user, onboardingCompleted: user?.onboardingCompleted || false }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnboardingCompleted: (completed) => set((state) => ({
        onboardingCompleted: completed,
        user: state.user ? { ...state.user, onboardingCompleted: completed } : null,
      })),
      initializeAuth: async () => {
        set({ isLoading: true });
        await initializeSession();
        const unsubscribe = auth.subscribe(async (sessionUser) => {
          if (!sessionUser) {
            set({ user: null, isAuthenticated: false, isLoading: false, onboardingCompleted: false });
            return;
          }
          try {
            const profile = await userApi.getCurrentUser();
            set({
              user: {
                uid: sessionUser.uid,
                email: sessionUser.email,
                displayName: profile?.name || sessionUser.displayName,
                phoneNumber: profile?.phoneNumber,
                photoURL: profile?.photoUrl,
                onboardingCompleted: profile?.onboardingCompleted || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
              onboardingCompleted: profile?.onboardingCompleted || false,
            });
          } catch {
            set({
              user: {
                uid: sessionUser.uid,
                email: sessionUser.email,
                displayName: sessionUser.displayName,
                onboardingCompleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
              onboardingCompleted: false,
            });
          }
        });
        set({ unsubscribe });
      },
      cleanup: () => {
        const unsub = get().unsubscribe;
        if (unsub) unsub();
        set({ unsubscribe: null });
      },
      updateUserProfile: async (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      signOut: async () => {
        get().cleanup();
        await authSignOut();
        set({ user: null, isAuthenticated: false, onboardingCompleted: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user, onboardingCompleted: state.onboardingCompleted }),
    }
  )
);
