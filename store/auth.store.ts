import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { User } from "@/types/user";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Platform } from "react-native";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  initializeAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
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
  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  const userData = userDoc.data();

  return {
    uid: firebaseUser.uid,
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
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      onboardingCompleted: false,

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
        set({ isLoading: true });

        return new Promise<void>((resolve) => {
          if (!auth) {
            set({ isLoading: false, isAuthenticated: false, user: null });
            resolve();
            return;
          }

          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const user = await firebaseUserToUser(firebaseUser);
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  onboardingCompleted: user.onboardingCompleted,
                });
              } catch (error) {
                set({ isLoading: false, isAuthenticated: false, user: null });
              }
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                onboardingCompleted: false,
              });
            }
            unsubscribe();
            resolve();
          });
        });
      },

      updateUserProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
          await setDoc(doc(db, "users", user.uid), updatedUser, { merge: true });
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      signOut: async () => {
        const { signOut: firebaseSignOut } = await import("@/lib/firebase");
        await firebaseSignOut();
        set({
          user: null,
          isAuthenticated: false,
          onboardingCompleted: false,
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

