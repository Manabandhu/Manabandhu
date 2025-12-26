import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth.store";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "@/components/ui/SplashScreen";
import { FontProvider } from "@/components/FontProvider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FontProvider>
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
            <Stack.Screen name="rooms" />
            <Stack.Screen name="jobs" />
            <Stack.Screen name="rides" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="qa" />
            <Stack.Screen name="uscis" />
            <Stack.Screen name="immigration" />
            <Stack.Screen name="expenses" />
            <Stack.Screen name="splitly" />
            <Stack.Screen name="utilities" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="community" />
          </Stack>
        </FontProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

