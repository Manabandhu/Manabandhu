import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function JobDetail() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Frontend Engineer
      </Text>
      <Text className="text-gray-700 dark:text-gray-300">
        Visa: H1B • Location: San Francisco
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        Job description placeholder with responsibilities and requirements.
      </Text>

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Apply Job</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 rounded-xl py-3">
        <Text className="text-gray-900 dark:text-white text-center">Save Job</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


