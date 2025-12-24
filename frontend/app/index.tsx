import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { View, ActivityIndicator } from "react-native";
import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";

export default function Index() {
  const { isLoading, isAuthenticated, onboardingCompleted, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.root} />;
  }

  if (!onboardingCompleted) {
    return <Redirect href={ROUTES.onboarding.welcome} />;
  }

  return <Redirect href={ROUTES.tabs.home} />;
}

