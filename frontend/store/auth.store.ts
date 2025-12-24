import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { User } from "@/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { userApi } from "@/lib/api";
import { Platform } from "react-native";

const userDocCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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

// Web-compatible storage fallback
const webStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(name);
    }
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return webStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      return webStorage.setItem(name, value);
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      return webStorage.removeItem(name);
    }
    await SecureStore.deleteItemAsync(name);
  },
};

const firebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const uid = firebaseUser.uid;
  
  const cached = userDocCache.get(uid);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return {
      ...cached.data,
      email: firebaseUser.email || cached.data.email,
      phoneNumber: firebaseUser.phoneNumber || cached.data.phoneNumber,
      displayName: firebaseUser.displayName || cached.data.displayName,
      photoURL: firebaseUser.photoURL || cached.data.photoURL,
    };
  }

  try {
    const userData = await userApi.getCurrentUser();
    
    const user: User = {
      uid,
      email: firebaseUser.email || undefined,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      displayName: firebaseUser.displayName || userData?.name || undefined,
      photoURL: firebaseUser.photoURL || userData?.photoUrl || undefined,
      country: userData?.country || undefined,
      city: userData?.city || undefined,
      role: userData?.role || undefined,
      onboardingCompleted: userData?.onboardingCompleted || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userDocCache.set(uid, { data: user, timestamp: now });

    return user;
  } catch (error) {
    const basicUser: User = {
      uid,
      email: firebaseUser.email || undefined,
      phoneNumber: firebaseUser.phoneNumber || undefined,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return basicUser;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      onboardingCompleted: false,
      unsubscribe: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          onboardingCompleted: user?.onboardingCompleted || false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setOnboardingCompleted: (completed) => {
        set((state) => {
          const updatedUser = state.user
            ? { ...state.user, onboardingCompleted: completed }
            : null;
          
          // Update cache if user exists
          if (updatedUser) {
            userDocCache.set(updatedUser.uid, { 
              data: updatedUser, 
              timestamp: Date.now() 
            });
          }
          
          return {
            onboardingCompleted: completed,
            user: updatedUser,
          };
        });
      },

      initializeAuth: async () => {
        // Don't reinitialize if already authenticated and not loading
        const currentState = get();
        if (currentState.isAuthenticated && currentState.user && !currentState.isLoading) {
          return;
        }

        // Clean up any existing listener
        const { unsubscribe: existingUnsubscribe } = get();
        if (existingUnsubscribe) {
          existingUnsubscribe();
        }

        // Only set loading if we don't have persisted auth state
        if (!currentState.user) {
          set({ isLoading: true });
        }

        return new Promise<void>((resolve) => {
          if (!auth) {
            set({ isLoading: false, isAuthenticated: false, user: null, unsubscribe: null });
            resolve();
            return;
          }

          let isResolved = false;
          const timeoutId = setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              set({ isLoading: false });
              resolve();
            }
          }, 10000); // 10 second timeout

          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(timeoutId);
            
            if (firebaseUser) {
              try {
                const user = await firebaseUserToUser(firebaseUser);
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  onboardingCompleted: user.onboardingCompleted,
                  unsubscribe,
                });
              } catch (error) {
                console.error('Error converting Firebase user:', error);
                set({ isLoading: false, isAuthenticated: false, user: null, unsubscribe });
              }
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                onboardingCompleted: false,
                unsubscribe,
              });
            }
            
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          });
        });
      },

      cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      updateUserProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
          
          userDocCache.set(user.uid, { data: updatedUser, timestamp: Date.now() });
          
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      signOut: async () => {
        const { signOut: firebaseSignOut } = await import("../lib/firebase");
        const { cleanup } = get();
        cleanup();
        await firebaseSignOut();
        set({
          user: null,
          isAuthenticated: false,
          onboardingCompleted: false,
          unsubscribe: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
