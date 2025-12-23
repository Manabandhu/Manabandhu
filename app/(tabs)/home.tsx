import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GluestackButton } from "@/components/ui/gluestack-index";
import { useAuthStore } from "@/store/auth.store";
import { GRADIENTS } from "@/constants/colors";
import { ROUTES } from "@/constants/routes";
import {
  MapPinIcon,
  BellIcon,
  SearchIcon,
  HomeIcon,
  BriefcaseIcon,
  CompassIcon,
  BusIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
} from "@/components/ui/Icons";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [location, setLocation] = useState("San Francisco, CA");
  const [search, setSearch] = useState("");

  const featureCards = useMemo(
    () => [
      {
        label: "Rooms",
        description: "Verified stays & roommates",
        icon: HomeIcon,
        route: ROUTES.tabs.rooms,
        accent: "#4F46E5",
        background: "#EEF2FF",
      },
      {
        label: "Rides",
        description: "Shared rides & shuttles",
        icon: BusIcon,
        route: ROUTES.tabs.rides,
        accent: "#0EA5E9",
        background: "#E0F2FE",
      },
      {
        label: "Jobs",
        description: "Trusted openings & referrals",
        icon: BriefcaseIcon,
        route: ROUTES.tabs.jobs,
        accent: "#F59E0B",
        background: "#FEF3C7",
      },
      {
        label: "Immigration",
        description: "Guides & community answers",
        icon: CompassIcon,
        route: ROUTES.tabs.community,
        accent: "#10B981",
        background: "#D1FAE5",
      },
      {
        label: "Expenses",
        description: "Track and split bills",
        icon: DollarSignIcon,
        route: ROUTES.tabs.expenses,
        accent: "#2563EB",
        background: "#DBEAFE",
      },
      {
        label: "Deals",
        description: "Crowdsourced savings nearby",
        icon: ShoppingBagIcon,
        route: ROUTES.tabs.utilities,
        accent: "#EC4899",
        background: "#FCE7F3",
      },
    ],
    []
  );

  const quickFilters = [
    { label: "Housing", icon: HomeIcon, route: ROUTES.tabs.rooms, color: "#4F46E5", background: "#EEF2FF" },
    { label: "Rides", icon: BusIcon, route: ROUTES.tabs.rides, color: "#0EA5E9", background: "#E0F2FE" },
    { label: "Jobs", icon: BriefcaseIcon, route: ROUTES.tabs.jobs, color: "#F59E0B", background: "#FEF3C7" },
  ];

  const nearbyUpdates = [
    { title: "2 verified room listings near you", meta: "5 min ago • Fremont", tag: "Housing" },
    { title: "Carpool to downtown leaves at 6 PM", meta: "Today • 1 seat left", tag: "Rides" },
    { title: "Weekend hiring event for students", meta: "Sat 10 AM • Free entry", tag: "Jobs" },
  ];

  const communityHighlights = [
    { title: "Visa bulletin updated for F1/F2", meta: "Immigration • 2h ago" },
    { title: "Best grocery deals this week", meta: "Deals • Crowdsourced" },
  ];

  const events = [
    { title: "Community meetup", meta: "Fri 6 PM • 1.2 mi away", tag: "Community" },
    { title: "Budgeting workshop", meta: "Thu 5 PM • Online", tag: "Money" },
  ];

  const supportActions = [
    {
      label: "SOS",
      description: "Call local helplines",
      color: "#FEE2E2",
      textColor: "#B91C1C",
      route: ROUTES.tabs.chat,
    },
    {
      label: "Report issue",
      description: "Flag scams or safety concerns",
      color: "#E0E7FF",
      textColor: "#3730A3",
      route: ROUTES.tabs.admin,
    },
    {
      label: "Talk to support",
      description: "Chat with ManaBandhu",
      color: "#ECFDF3",
      textColor: "#166534",
      route: ROUTES.tabs.community,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.auth.root);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <LinearGradient
          colors={GRADIENTS.primaryShort}
          className="mx-4 mt-2 rounded-3xl p-5 shadow-lg"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-sm text-white/80">Hi, {user?.displayName || "Friend"}</Text>
              <Text className="text-3xl font-bold text-white mt-1">
                Let's get you settled today
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-3">
                <View className="flex-row items-center bg-white/15 rounded-full px-3 py-2">
                  <MapPinIcon size={16} color="#FFFFFF" />
                  <Text className="text-white text-sm font-semibold ml-2">
                    {location}
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/10 rounded-full px-3 py-2">
                  <BellIcon size={16} color="#FFFFFF" />
                  <Text className="text-white text-sm ml-2">Alerts on</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-4 bg-white/10 rounded-2xl px-3 py-2">
            <Text className="text-xs text-white/80">Your location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter city"
              placeholderTextColor="rgba(255,255,255,0.75)"
              className="text-white text-base mt-1"
            />
          </View>

          <View className="mt-4 bg-white rounded-2xl px-4 py-3 flex-row items-center shadow-sm">
            <SearchIcon size={18} color="#4F46E5" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search rooms, rides, jobs..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-gray-900"
              returnKeyType="search"
            />
          </View>

          <View className="flex-row flex-wrap gap-2 mt-3">
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.label}
                  className="flex-row items-center rounded-full px-3 py-2"
                  style={{ backgroundColor: filter.background }}
                  activeOpacity={0.85}
                  onPress={() => router.push(filter.route)}
                >
                  <IconComponent size={16} color={filter.color} />
                  <Text className="ml-2 text-sm font-semibold" style={{ color: filter.color }}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        <View className="px-4 mt-6 gap-5">
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Explore ManaBandhu</Text>
              <Text className="text-sm font-semibold text-indigo-600">Personalized</Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-3">
              {featureCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <TouchableOpacity
                    key={card.label}
                    className="w-[48%] rounded-2xl p-4"
                    style={{ backgroundColor: card.background }}
                    activeOpacity={0.85}
                    onPress={() => router.push(card.route)}
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: "#FFFFFF" }}>
                      <IconComponent size={22} color={card.accent} />
                    </View>
                    <Text className="text-base font-semibold text-gray-900">
                      {card.label}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1 leading-5">
                      {card.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">Updates near you</Text>
              <Text className="text-sm text-gray-500">Refreshed hourly</Text>
            </View>
            <View className="gap-3">
              {nearbyUpdates.map((item) => (
                <View
                  key={item.title}
                  className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100"
                >
                  <Text className="text-sm font-semibold text-gray-900">{item.title}</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-600">{item.meta}</Text>
                    <Text className="text-xs font-semibold text-indigo-600">
                      {item.tag}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">Community highlights</Text>
              <UsersIcon size={18} color="#4B5563" />
            </View>
            <View className="gap-3">
              {communityHighlights.map((item) => (
                <View key={item.title} className="flex-row justify-between items-center">
                  <View className="flex-1 pr-4">
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-gray-600 mt-1">{item.meta}</Text>
                  </View>
                  <TouchableOpacity
                    className="px-3 py-2 rounded-full bg-gray-100"
                    activeOpacity={0.8}
                    onPress={() => router.push(ROUTES.tabs.community)}
                  >
                    <Text className="text-xs font-semibold text-indigo-600">
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">Community calendar</Text>
              <CalendarIcon size={18} color="#4B5563" />
            </View>
            <View className="gap-3">
              {events.map((event) => (
                <View
                  key={event.title}
                  className="flex-row items-center justify-between bg-gray-50 rounded-xl px-3 py-3 border border-gray-100"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-gray-900">
                      {event.title}
                    </Text>
                    <Text className="text-xs text-gray-600 mt-1">{event.meta}</Text>
                  </View>
                  <Text className="text-xs font-semibold text-indigo-600">
                    {event.tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">Safety & support</Text>
              <Text className="text-xs text-gray-500">Always visible</Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-3">
              {supportActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  className="w-[48%] rounded-2xl p-4"
                  style={{ backgroundColor: action.color }}
                  activeOpacity={0.85}
                  onPress={() => router.push(action.route)}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: action.textColor }}
                  >
                    {action.label}
                  </Text>
                  <Text
                    className="text-sm mt-2 leading-5"
                    style={{ color: action.textColor + "CC" }}
                  >
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GluestackButton
            onPress={handleSignOut}
            variant="outline"
            fullWidth
          >
            Sign Out
          </GluestackButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
