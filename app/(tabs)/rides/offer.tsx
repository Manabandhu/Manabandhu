import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";

export default function OfferRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Offer a ride
      </Text>
      <TextInput
        value={from}
        onChangeText={setFrom}
        placeholder="From"
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />
      <TextInput
        value={to}
        onChangeText={setTo}
        placeholder="To"
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Publish ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


