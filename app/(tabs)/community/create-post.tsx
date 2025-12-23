import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";

export default function CreateCommunityPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Share your thoughts..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />
      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


