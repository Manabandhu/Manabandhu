import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useAuthStore } from "@/store/auth.store";
import * as Haptics from "expo-haptics";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(onboarding)/goals");
  };

  return (
    <LinearGradient
      colors={["#6366f1", "#4f46e5", "#4338ca"]}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-12 justify-center"
      >
        <Progress current={1} total={4} />

        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white mb-4 text-center">
            Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
          </Text>
          <Text className="text-lg text-white/90 text-center mb-8">
            Let's set up your ManaBandhu experience
          </Text>
        </View>

        <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8">
          <Text className="text-white text-base leading-6 text-center">
            We'll help you personalize your journey in just a few simple steps.
            This will only take a minute.
          </Text>
        </View>

        <Button
          title="Get Started"
          onPress={handleContinue}
          variant="secondary"
          fullWidth
          size="lg"
        />
      </ScrollView>
    </LinearGradient>
  );
}

