import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function RoomDetail() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1505692069463-5e3405e3e7ee" }}
        className="h-56 w-full"
      />
      <View className="px-6 py-4 space-y-3">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Sunny studio in SOMA
        </Text>
        <Text className="text-blue-600 dark:text-blue-300 text-lg">$1200/mo</Text>
        <Text className="text-gray-700 dark:text-gray-300">
          Room Type: Studio • Gender: Any • Amenities: Wi-Fi, Parking, Laundry
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          Cozy studio with natural light. Close to transit and downtown.
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity className="flex-1 bg-blue-600 rounded-xl py-3">
            <Text className="text-white text-center font-semibold">Contact owner</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-14 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center">
            <Text className="text-xl">★</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4"
          onPress={() => router.push("/(tabs)/rooms/map")}
        >
          <Text className="text-gray-900 dark:text-white font-semibold">View on map</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Map placeholder (Google/Apple Maps)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


