import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function ResumeTips() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Resume Upload + AI Tips
      </Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <Text className="text-gray-900 dark:text-white font-semibold">Upload resume</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Placeholder dropzone/input for resume file.
        </Text>
      </View>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <Text className="text-gray-900 dark:text-white font-semibold">AI Tips (placeholder)</Text>
        <Text className="text-gray-600 dark:text-gray-400">
          - Quantify achievements{"\n"}- Highlight visa eligibility{"\n"}- Tailor keywords
        </Text>
      </View>

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


