import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import * as Haptics from "expo-haptics";

const goals = [
  { id: "health", title: "Health & Wellness", icon: "🏥" },
  { id: "education", title: "Education", icon: "📚" },
  { id: "career", title: "Career Growth", icon: "💼" },
  { id: "finance", title: "Financial Planning", icon: "💰" },
  { id: "travel", title: "Travel & Exploration", icon: "✈️" },
  { id: "relationships", title: "Relationships", icon: "❤️" },
  { id: "hobbies", title: "Hobbies & Interests", icon: "🎨" },
  { id: "community", title: "Community Service", icon: "🤝" },
];

export default function GoalsScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(onboarding)/location");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <Progress current={2} total={4} />

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            What are your goals?
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Select all that apply. You can change this later.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-8">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              onPress={() => toggleGoal(goal.id)}
              selected={selectedGoals.includes(goal.id)}
              className="w-[48%]"
            >
              <View className="items-center">
                <Text className="text-4xl mb-2">{goal.icon}</Text>
                <Text
                  className={`text-center font-semibold text-sm ${
                    selectedGoals.includes(goal.id)
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {goal.title}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

