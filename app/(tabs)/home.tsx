import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENTS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [location, setLocation] = useState("San Francisco, CA");
  const [search, setSearch] = useState("");

  const featureCards = useMemo(
    () => [
      { label: "Rooms", route: ROUTES.tabs.rooms },
      { label: "Rides", route: ROUTES.tabs.rides },
      { label: "Jobs", route: ROUTES.tabs.jobs },
      { label: "Immigration", route: ROUTES.tabs.community },
      { label: "Expenses", route: ROUTES.tabs.expenses },
      { label: "Deals", route: ROUTES.tabs.utilities },
    ],
    []
  );

  const quickActions = [
    { label: "SOS", description: "Emergency call", route: ROUTES.tabs.chat },
    { label: "Report", description: "Safety issue", route: ROUTES.tabs.admin },
    { label: "Help", description: "Get assistance", route: ROUTES.tabs.community },
  ];

  const nearby = [
    "2 new room listings near you",
    "Carpool to downtown at 6 PM",
    "Hiring event this weekend",
  ];

  const trending = [
    "Visa bulletin updates",
    "Top deals for students",
    "Affordable housing tips",
  ];

  const events = [
    "Career fair - Sat 10 AM",
    "Community meetup - Fri 6 PM",
    "Budgeting workshop - Thu 5 PM",
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.auth.root);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <LinearGradient colors={GRADIENTS.primaryShort} className="pt-16 pb-8 px-6">
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome back!
        </Text>
        <Text className="text-white/90 text-lg">
          {user?.displayName || "Friend"}
        </Text>
        <View className="mt-4 bg-white/20 rounded-xl px-4 py-3">
          <Text className="text-white/80 text-xs mb-1">Your location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter city"
            placeholderTextColor="#e5e7eb"
            className="text-white text-base"
          />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Search anything
          </Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rooms, rides, jobs, immigration..."
            placeholderTextColor="#9ca3af"
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
          />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Feature cards
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {featureCards.map((card) => (
              <TouchableOpacity
                key={card.label}
                className="w-[47%] bg-gray-100 dark:bg-gray-700 rounded-xl p-4"
                onPress={() => router.push(card.route)}
              >
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {card.label}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Explore {card.label.toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Nearby activity
          </Text>
          {nearby.map((item) => (
            <Text key={item} className="text-gray-700 dark:text-gray-300 mb-1">
              • {item}
            </Text>
          ))}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Trending posts
          </Text>
          {trending.map((item) => (
            <Text key={item} className="text-gray-700 dark:text-gray-300 mb-1">
              • {item}
            </Text>
          ))}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Events near you
          </Text>
          {events.map((item) => (
            <Text key={item} className="text-gray-700 dark:text-gray-300 mb-1">
              • {item}
            </Text>
          ))}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Emergency quick actions
          </Text>
          <View className="flex-row justify-between">
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                className="flex-1 bg-red-50 dark:bg-red-900/40 rounded-xl p-4 mx-1"
                onPress={() => router.push(item.route)}
              >
                <Text className="text-red-600 dark:text-red-200 font-semibold">
                  {item.label}
                </Text>
                <Text className="text-xs text-red-500 dark:text-red-300">
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

