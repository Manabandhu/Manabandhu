import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const chats = [
  { id: "1", name: "Alice", last: "See you soon" },
  { id: "2", name: "Group: Bay Area", last: "Event tonight!" },
];

export default function ChatList() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Chats
      </Text>
      {chats.map((chat) => (
        <TouchableOpacity
          key={chat.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
          onPress={() => router.push("/(tabs)/chat/conversation")}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {chat.name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">{chat.last}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}


