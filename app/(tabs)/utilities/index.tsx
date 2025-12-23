import React from "react";
import { View, Text, ScrollView } from "react-native";

const items = [
  "Live Currency Rates",
  "Gold & Silver Rates",
  "USCIS / Visa Tracker UI",
  "Package Tracking",
  "Flight Tracking",
  "Grocery List",
  "Reminders",
];

export default function Utilities() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Utilities
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-3">
        Placeholder tiles for all utility modules.
      </Text>
      {items.map((item) => (
        <View
          key={item}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-sm"
        >
          <Text className="text-gray-900 dark:text-white font-semibold">{item}</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Coming soon placeholder UI
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}



