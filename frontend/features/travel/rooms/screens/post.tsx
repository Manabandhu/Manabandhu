import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";

export default function PostRoom() {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Post Room Listing
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />
      <TextInput
        value={budget}
        onChangeText={setBudget}
        placeholder="Budget"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />

      <TouchableOpacity className="bg-blue-600 rounded-xl py-4">
        <Text className="text-white text-center font-semibold">Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


