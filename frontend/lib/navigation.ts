import { router } from "expo-router";
import { db, getCurrentUser } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

/**
 * After a successful auth event, decide where to send the user:
 * - If the Firestore user document does not exist → profile completion
 * - Otherwise → onboarding welcome (or tabs later)
 * 
 * Uses cached user data from auth store to avoid redundant Firestore reads
 */
export const navigateAfterAuth = async () => {
  const user = getCurrentUser();

  if (!user) return;

  // Check if user data is already in the store (from auth state listener)
  const authState = useAuthStore.getState();
  
  if (authState.user) {
    // Use cached user data from store
    if (!authState.user.onboardingCompleted) {
      router.replace(ROUTES.onboarding.welcome);
    } else {
      router.replace(ROUTES.tabs.home);
    }
    return;
  }

  // Fallback: fetch from Firestore if not in store
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    router.replace(ROUTES.auth.profile);
    return;
  }

  const userData = userDoc.data();
  const onboardingCompleted = !!userData?.onboardingCompleted;

  if (onboardingCompleted) {
    router.replace(ROUTES.tabs.home);
  } else {
    router.replace(ROUTES.onboarding.welcome);
  }
};


