import { router } from "expo-router";
import { db, getCurrentUser } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ROUTES } from "@/constants/routes";

/**
 * After a successful auth event, decide where to send the user:
 * - If the Firestore user document does not exist → profile completion
 * - Otherwise → onboarding welcome (or tabs later)
 */
export const navigateAfterAuth = async () => {
  const user = getCurrentUser();

  if (!user) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    router.replace(ROUTES.auth.profile);
    return;
  }

  router.replace(ROUTES.onboarding.welcome);
};


