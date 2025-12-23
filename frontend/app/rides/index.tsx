import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const rides = [
  { id: "1", from: "Downtown", to: "Airport", seats: 2, time: "6:00 PM" },
  { id: "2", from: "Mission", to: "SOMA", seats: 1, time: "5:15 PM" },
];

export default function RideShare() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Rides
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        Ride Feed, search, offer ride, route map, seats & chat with driver.
      </Text>

      {rides.map((ride) => (
        <TouchableOpacity
          key={ride.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
          onPress={() => router.push("/(tabs)/rides/detail")}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {ride.from} → {ride.to}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">Seats: {ride.seats}</Text>
          <Text className="text-gray-600 dark:text-gray-400">Time: {ride.time}</Text>
        </TouchableOpacity>
      ))}

      <View className="mt-4 space-y-3">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3"
          onPress={() => router.push("/(tabs)/rides/offer")}
        >
          <Text className="text-white text-center font-semibold">Offer Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3"
          onPress={() => router.push("/(tabs)/rides/my-rides")}
        >
          <Text className="text-gray-900 dark:text-white text-center">My Rides</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


