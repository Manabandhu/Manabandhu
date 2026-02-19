import { router } from "expo-router";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { userApi } from "@/lib/api";

export const navigateAfterAuth = async () => {
  const authState = useAuthStore.getState();
  
  if (authState.user) {
    if (!authState.user.onboardingCompleted) {
      router.replace(ROUTES.onboarding.welcome);
    } else {
      router.replace(ROUTES.tabs.home);
    }
    return;
  }

  try {
    const userData = await userApi.getCurrentUser();
    
    if (!userData) {
      router.replace(ROUTES.auth.profile);
      return;
    }

    if (userData.onboardingCompleted) {
      router.replace(ROUTES.tabs.home);
    } else {
      router.replace(ROUTES.onboarding.welcome);
    }
  } catch (error) {
    router.replace(ROUTES.auth.profile);
  }
};
