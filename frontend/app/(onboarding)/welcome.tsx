import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

export default function OnboardingWelcome() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAuthStore();

  useEffect(() => {
    // Skip onboarding for now
    setOnboardingCompleted(true);
    router.replace("/(tabs)/home");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}
