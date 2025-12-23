import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { openMapsSearch } from "@/lib/maps";

export default function RoomMap() {
  const listings = [
    {
      id: "soma",
      title: "Sunny Studio in SOMA",
      price: "$1200/mo",
      address: "855 Mission St, San Francisco, CA",
      distance: "0.6 mi",
    },
    {
      id: "mission",
      title: "Private room near BART",
      price: "$980/mo",
      address: "3180 16th St, San Francisco, CA",
      distance: "1.2 mi",
    },
    {
      id: "sunset",
      title: "Shared room in Sunset",
      price: "$750/mo",
      address: "1435 Irving St, San Francisco, CA",
      distance: "4.1 mi",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Rooms near you
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mt-1">
        Browse nearby listings and open them directly in Maps.
      </Text>

      <View className="mt-4 space-y-3">
        {listings.map((listing) => (
          <View
            key={listing.id}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-2"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 dark:text-white font-semibold">
                {listing.title}
              </Text>
              <Text className="text-blue-600 dark:text-blue-300 font-semibold">
                {listing.price}
              </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {listing.address}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 dark:text-gray-500 text-sm">
                {listing.distance} away
              </Text>
              <TouchableOpacity
                className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700"
                onPress={() => openMapsSearch(listing.address)}
              >
                <Text className="text-gray-900 dark:text-white text-sm font-semibold">
                  Open in Maps
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}



