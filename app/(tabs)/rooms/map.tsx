import React from "react";
import { View, Text } from "react-native";

export default function RoomMap() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Map View
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        Placeholder for Google/Apple Maps integration.
      </Text>
    </View>
  );
}


