import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function RideDetail() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Downtown → Airport
      </Text>
      <Text className="text-gray-700 dark:text-gray-300">Seats available: 2</Text>
      <Text className="text-gray-700 dark:text-gray-300">Time: 6:00 PM</Text>
      <Text className="text-gray-600 dark:text-gray-400">
        Route map placeholder. Chat with driver placeholder.
      </Text>

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Chat with driver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


