import React from "react";
import { View, Text, ScrollView } from "react-native";

const past = [{ id: "p1", route: "Mission → SOMA", status: "Completed" }];
const upcoming = [{ id: "u1", route: "Downtown → Airport", status: "Upcoming" }];

export default function MyRides() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        My Rides
      </Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Upcoming
      </Text>
      {upcoming.map((ride) => (
        <View
          key={ride.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <Text className="text-gray-900 dark:text-white">{ride.route}</Text>
          <Text className="text-gray-600 dark:text-gray-300">{ride.status}</Text>
        </View>
      ))}
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Past
      </Text>
      {past.map((ride) => (
        <View
          key={ride.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <Text className="text-gray-900 dark:text-white">{ride.route}</Text>
          <Text className="text-gray-600 dark:text-gray-300">{ride.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}




