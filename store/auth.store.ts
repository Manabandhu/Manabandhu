import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { User } from "@/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Platform } from "react-native";

// Cache for user documents to avoid redundant Firestore reads
const userDocCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  
  // Check cache first
  const cached = userDocCache.get(uid);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    // Return cached data but update with latest Firebase user data
    return {
      ...cached.data,
      email: firebaseUser.email || cached.data.email,
      phoneNumber: firebaseUser.phoneNumber || cached.data.phoneNumber,
      displayName: firebaseUser.displayName || cached.data.displayName,
      photoURL: firebaseUser.photoURL || cached.data.photoURL,
    };
  }

  // Fetch from Firestore
  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();

  const user: User = {
    uid,
    email: firebaseUser.email || undefined,
    phoneNumber: firebaseUser.phoneNumber || undefined,
    displayName: firebaseUser.displayName || userData?.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    country: userData?.country || undefined,
    city: userData?.city || undefined,
    role: userData?.role || undefined,
    onboardingCompleted: userData?.onboardingCompleted || false,
    createdAt: userData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update cache
  userDocCache.set(uid, { data: user, timestamp: now });

  return user;
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

      setOnboardingCompleted: (completed) =>
        set((state) => ({
          onboardingCompleted: completed,
          user: state.user
            ? { ...state.user, onboardingCompleted: completed }
            : null,
        })),

      initializeAuth: async () => {
        // Clean up any existing listener
        const { unsubscribe: existingUnsubscribe } = get();
        if (existingUnsubscribe) {
          existingUnsubscribe();
        }

        set({ isLoading: true });

        return new Promise<void>((resolve) => {
          if (!auth) {
            set({ isLoading: false, isAuthenticated: false, user: null, unsubscribe: null });
            resolve();
            return;
          }

          let isResolved = false;
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
            
            // Only resolve once on initial auth state check
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
          await setDoc(doc(db, "users", user.uid), updatedUser, { merge: true });
          
          // Update cache
          userDocCache.set(user.uid, { data: updatedUser, timestamp: Date.now() });
          
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      signOut: async () => {
        const { signOut: firebaseSignOut } = await import("../lib/firebase.js");
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

