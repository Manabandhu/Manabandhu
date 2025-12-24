import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Index() {
  const { isLoading, isAuthenticated, onboardingCompleted } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.root} />;
  }

  if (!onboardingCompleted) {
    return <Redirect href={ROUTES.onboarding.welcome} />;
  }

  return <Redirect href={ROUTES.tabs.home} />;
}

