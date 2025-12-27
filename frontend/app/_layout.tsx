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
import { registerForPushNotifications, setupNotificationListeners } from "@/lib/notifications";
import { useRouter } from "expo-router";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initializeAuth, isLoading, cleanup, isAuthenticated } = useAuthStore();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

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

  // Set up push notifications when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanup: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        // Register for push notifications
        await registerForPushNotifications();

        // Set up notification listeners
        cleanup = setupNotificationListeners(
          (notification) => {
            // Handle notification received while app is in foreground
            console.log('Notification received:', notification);
          },
          (response) => {
            // Handle notification tap
            const data = response.notification.request.content.data;
            if (data?.type) {
              // Navigate based on notification type
              switch (data.type) {
                case 'RIDE_REQUESTED':
                  if (data.ridePostId) {
                    router.push(`/rides/detail?id=${data.ridePostId}`);
                  }
                  break;
                case 'USCIS_STATUS_CHANGE':
                  if (data.caseId) {
                    router.push(`/uscis/case/${data.caseId}`);
                  } else {
                    router.push('/uscis');
                  }
                  break;
                default:
                  // Navigate to home or notifications screen
                  router.push('/(tabs)/home');
              }
            }
          }
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAuthenticated, router]);

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
            <Stack.Screen name="rooms" />
            <Stack.Screen name="expenses" />
            <Stack.Screen name="index" />
          </Stack>
        </FontProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

