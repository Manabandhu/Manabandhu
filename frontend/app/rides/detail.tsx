import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { openMapsDirections } from "@/lib/maps";

export default function RideDetail() {
  const router = useRouter();
  const routeLabel = "Downtown San Francisco → SFO Airport";
  const pickupPoint = "1 Market St, San Francisco, CA";
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">{routeLabel}</Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Pickup</Text>
          <Text className="text-gray-900 dark:text-white font-semibold">6:00 PM</Text>
        </View>
        <Text className="text-gray-700 dark:text-gray-300">{pickupPoint}</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Seats available</Text>
          <Text className="text-gray-900 dark:text-white font-semibold">2</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Price</Text>
          <Text className="text-gray-900 dark:text-white font-semibold">$18</Text>
        </View>
      </View>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-1">
        <Text className="text-gray-900 dark:text-white font-semibold">Driver</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Priya K. • 4.9★ • 124 rides</Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-3"
          onPress={() => openMapsDirections(pickupPoint)}
        >
          <Text className="text-gray-900 dark:text-white text-center font-semibold">
            Open route
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-xl py-3"
          onPress={() => router.push("/chat/conversation")}
        >
          <Text className="text-white text-center font-semibold">Chat with driver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

