import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const jobs = [
  { id: "1", title: "Frontend Engineer", visa: "H1B", location: "SF" },
  { id: "2", title: "Product Manager", visa: "OPT", location: "Remote" },
];

const filters = ["Role", "Visa Type", "Location"];

export default function Jobs() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Jobs & Career
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        Listings, filters, apply, save, recruiter posting, resume uploads, AI tips.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {filters.map((f) => (
          <View
            key={f}
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-gray-800 dark:text-gray-200 text-sm">{f}</Text>
          </View>
        ))}
      </ScrollView>

      {jobs.map((job) => (
        <TouchableOpacity
          key={job.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
          onPress={() => router.push("/(tabs)/jobs/detail")}
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {job.title}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">
            {job.location} • Visa: {job.visa}
          </Text>
        </TouchableOpacity>
      ))}

      <View className="mt-4 space-y-3">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3"
          onPress={() => router.push("/(tabs)/jobs/post")}
        >
          <Text className="text-white text-center font-semibold">Post Job (Recruiter)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3"
          onPress={() => router.push("/(tabs)/jobs/resume-tips")}
        >
          <Text className="text-gray-900 dark:text-white text-center">
            Upload Resume + AI Tips
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


