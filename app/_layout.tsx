import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.store";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "@/components/ui/SplashScreen";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initializeAuth, isLoading } = useAuthStore();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initializeAuth();
      } catch (e) {
        console.error("Error initializing auth:", e);
      } finally {
        setAppIsReady(true);
        // Hide native splash after a short delay to allow custom splash animation
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 500);
      }
    };

    prepare();
  }, [initializeAuth]);

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
    <>
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
    </>
  );
}

