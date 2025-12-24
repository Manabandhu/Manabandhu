import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.store";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "@/components/ui/SplashScreen";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FontProvider } from "@/components/FontProvider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TIMING } from "@/constants/timing";
import { Platform } from "react-native";
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
        if (__DEV__) {
          console.error("Error initializing auth:", e);
        }
        // Show error to user in production
      } finally {
        setAppIsReady(true);
        // Delay splash hide for better UX
        setTimeout(() => {
          SplashScreen.hideAsync();
          setTimeout(() => setShowCustomSplash(false), 300);
        }, TIMING.SPLASH_HIDE_DELAY);
      }
    };

    prepare();

    return () => {
      cleanup();
    };
  }, []);

  const handleSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (showCustomSplash || !appIsReady) {
    return (
      <>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />
        <CustomSplashScreen onAnimationComplete={handleSplashComplete} />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontProvider>
        <ErrorBoundary>
          <StatusBar style={Platform.OS === 'ios' ? 'auto' : 'dark'} />
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
      </FontProvider>
    </GestureHandlerRootView>
  );
}

