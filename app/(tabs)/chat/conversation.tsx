import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const messages = [
  { id: "1", from: "Alice", text: "Hi there!" },
  { id: "2", from: "You", text: "Hello!" },
];

export default function Conversation() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6 py-6">
        {messages.map((m) => (
          <View
            key={m.id}
            className={`mb-3 ${
              m.from === "You" ? "items-end" : "items-start"
            }`}
          >
            <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 max-w-[80%]">
              <Text className="text-gray-900 dark:text-white font-semibold">{m.from}</Text>
              <Text className="text-gray-700 dark:text-gray-300">{m.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="px-6 pb-6">
        <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-gray-900 dark:text-white text-center">Media preview / Send</Text>
        </TouchableOpacity>
        <View className="flex-row justify-between mt-3">
          <Text className="text-red-500 dark:text-red-300">Block</Text>
          <Text className="text-red-500 dark:text-red-300">Report</Text>
          <Text className="text-blue-600 dark:text-blue-300">View Profile</Text>
        </View>
      </View>
    </View>
  );
}


