import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { requestLocationPermission } from "@/lib/permissions";
import * as Haptics from "expo-haptics";

export default function LocationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const granted = await requestLocationPermission();
      if (granted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.push("/(onboarding)/notifications");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/notifications");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
      >
        <Progress current={3} total={4} />

        <View className="flex-1 justify-center items-center mb-8">
          <Text className="text-6xl mb-6">📍</Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Enable Location
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 px-4">
            We use your location to provide personalized recommendations and
            connect you with nearby services and events.
          </Text>
        </View>

        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-8">
          <Text className="text-sm text-gray-700 dark:text-gray-300 text-center">
            Your location data is encrypted and only used to enhance your
            experience. You can change this anytime in settings.
          </Text>
        </View>

        <View className="space-y-3">
          <Button
            title="Enable Location"
            onPress={handleContinue}
            loading={loading}
            fullWidth
          />
          <Button
            title="Skip for Now"
            onPress={handleSkip}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

