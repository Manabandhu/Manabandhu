import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const categories = ["Immigration", "Housing", "Jobs", "Travel"];
const posts = [
  { id: "1", title: "Visa bulletin update", votes: 120 },
  { id: "2", title: "Best neighborhoods to live", votes: 85 },
];

export default function CommunityFeed() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Community
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        Reddit-style feed with upvote/downvote, comments, categories, report UI.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {categories.map((cat) => (
          <View
            key={cat}
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-gray-800 dark:text-gray-200 text-sm">{cat}</Text>
          </View>
        ))}
      </ScrollView>

      {posts.map((post) => (
        <View
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {post.title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">Upvotes: {post.votes}</Text>
          <View className="flex-row gap-3 mt-2">
            <Text className="text-blue-600 dark:text-blue-300">Comments</Text>
            <Text className="text-gray-500 dark:text-gray-300">Upvote / Downvote</Text>
            <Text className="text-red-500 dark:text-red-300">Report</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        className="bg-blue-600 rounded-xl py-3 mt-2"
        onPress={() => router.push("/(tabs)/community/create-post")}
      >
        <Text className="text-white text-center font-semibold">Create Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


