import React from "react";
import { View, Text, ScrollView } from "react-native";

const myListings = [
  { id: "1", title: "Shared 2BHK", status: "Live" },
  { id: "2", title: "Studio sublet", status: "Draft" },
];

export default function MyListings() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        My Listings Dashboard
      </Text>
      {myListings.map((listing) => (
        <View
          key={listing.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {listing.title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">Status: {listing.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}



