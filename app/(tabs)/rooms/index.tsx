import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const mockRooms = [
  { id: "1", title: "Sunny studio", price: "$1200/mo", area: "SOMA" },
  { id: "2", title: "2BHK shared", price: "$900/mo", area: "Mission" },
];

const filters = ["Location", "Budget", "Room Type", "Gender Pref", "Amenities"];

export default function RoomFinder() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Rooms
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        Zillow + Apartments.com inspired feed with map + filters.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {filters.map((item) => (
          <View
            key={item}
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-gray-800 dark:text-gray-200 text-sm">{item}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        className="bg-blue-100 dark:bg-blue-900/40 rounded-xl p-4 mb-4"
        onPress={() => router.push("/(tabs)/rooms/map")}
      >
        <Text className="text-blue-700 dark:text-blue-100 font-semibold">
          Map View
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 text-sm">
          Google/Apple Maps placeholder
        </Text>
      </TouchableOpacity>

      {mockRooms.map((room) => (
        <TouchableOpacity
          key={room.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
          onPress={() => router.push("/(tabs)/rooms/detail")}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {room.title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">{room.area}</Text>
          <Text className="text-blue-600 dark:text-blue-300">{room.price}</Text>
        </TouchableOpacity>
      ))}

      <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Actions
        </Text>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
          onPress={() => router.push("/(tabs)/rooms/post")}
        >
          <Text className="text-gray-900 dark:text-white">Post Room Listing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
          onPress={() => router.push("/(tabs)/rooms/my-listings")}
        >
          <Text className="text-gray-900 dark:text-white">My Listings Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"
          onPress={() => router.push("/(tabs)/rooms/detail")}
        >
          <Text className="text-gray-900 dark:text-white">Sample Detail & Gallery</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


