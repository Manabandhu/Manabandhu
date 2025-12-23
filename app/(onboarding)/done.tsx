import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";
import { doc, setDoc } from "firebase/firestore";
import { db, getCurrentUser } from "@/lib/firebase";

export default function DoneScreen() {
  const router = useRouter();
  const { setOnboardingCompleted, updateUserProfile } = useAuthStore();

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          await setDoc(
            doc(db, "users", user.uid),
            { onboardingCompleted: true, updatedAt: new Date().toISOString() },
            { merge: true }
          );
          await updateUserProfile({ onboardingCompleted: true });
          setOnboardingCompleted(true);
        }
      } catch (error) {
      }
    };

    completeOnboarding();
  }, [setOnboardingCompleted, updateUserProfile]);

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/home");
  };

  return (
    <LinearGradient
      colors={["#6366f1", "#4f46e5", "#4338ca"]}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Text className="text-6xl mb-6">🎉</Text>
          <Text className="text-4xl font-bold text-white mb-4 text-center">
            You're All Set!
          </Text>
          <Text className="text-lg text-white/90 text-center">
            Welcome to ManaBandhu. Let's start your journey together.
          </Text>
        </View>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="secondary"
          fullWidth
          size="lg"
        />
      </View>
    </LinearGradient>
  );
}

