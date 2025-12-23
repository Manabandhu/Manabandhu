import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { requestNotificationPermission } from "@/lib/permissions";
import * as Haptics from "expo-haptics";

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const granted = await requestNotificationPermission();
      if (granted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.push("/(onboarding)/done");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(onboarding)/done");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-8"
      >
        <Progress current={4} total={4} />

        <View className="flex-1 justify-center items-center mb-8">
          <Text className="text-6xl mb-6">🔔</Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Stay Updated
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 px-4">
            Get notified about important updates, reminders, and personalized
            recommendations to help you achieve your goals.
          </Text>
        </View>

        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-8">
          <Text className="text-sm text-gray-700 dark:text-gray-300 text-center">
            You can customize notification preferences anytime in settings.
            We'll never spam you.
          </Text>
        </View>

        <View className="space-y-3">
          <Button
            title="Enable Notifications"
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

