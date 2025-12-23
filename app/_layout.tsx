import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.store";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "@/components/ui/SplashScreen";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { TIMING } from "@/constants/timing";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initializeAuth, isLoading, cleanup } = useAuthStore();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initializeAuth();
      } catch (e) {
        // Error is already handled in the store
        // Just log it here for debugging
        if (__DEV__) {
          console.error("Error initializing auth:", e);
        }
      } finally {
        setAppIsReady(true);
        // Hide native splash after a short delay to allow custom splash animation
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, TIMING.SPLASH_HIDE_DELAY);
      }
    };

    prepare();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initializeAuth, cleanup]);

  const handleSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (showCustomSplash) {
    return (
      <>
        <StatusBar style="light" />
        <CustomSplashScreen onAnimationComplete={handleSplashComplete} />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}

