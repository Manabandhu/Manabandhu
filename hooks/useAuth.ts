import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    onboardingCompleted,
    initializeAuth,
    setOnboardingCompleted,
    updateUserProfile,
    signOut,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    onboardingCompleted,
    setOnboardingCompleted,
    updateUserProfile,
    signOut,
  };
};

