import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAuthStore } from "@/store/auth.store";

const settings = [
  "Edit Profile",
  "Verification status",
  "Saved Items",
  "My Posts",
  "My Listings",
  "Notifications",
  "Language",
  "Theme",
  "Privacy",
  "Logout",
];

export default function Profile() {
  const { user } = useAuthStore();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Profile & Settings
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        {user?.displayName || "User"} • Verification pending
      </Text>

      {settings.map((item) => (
        <View
          key={item}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-sm"
        >
          <Text className="text-gray-900 dark:text-white">{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}



