import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ridesApi } from "@/lib/api/rides";
import { RidePostSummary, RideStatus } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { useRouter } from "expo-router";
import { CarIcon } from "@/components/ui/Icons";

const TABS: { label: string; status: RideStatus }[] = [
  { label: "Active", status: "OPEN" },
  { label: "In Talks", status: "IN_TALKS" },
  { label: "Booked", status: "BOOKED" },
  { label: "Archived", status: "ARCHIVED" },
];

export default function MyRides() {
  const router = useRouter();
  const [rides, setRides] = useState<RidePostSummary[]>([]);
  const [activeStatus, setActiveStatus] = useState<RideStatus>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(
    () => rides.filter((ride) => ride.status === activeStatus),
    [rides, activeStatus]
  );

  const loadRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ridesApi.getMyPosts();
      setRides(response.content || []);
    } catch {
      setError("Unable to load your rides.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRides();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-3xl font-bold text-gray-900">My Rides</Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => router.push("/rides/offer")}
        >
          <Text className="text-white font-semibold">+ Offer</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-500 mb-5">Manage the rides you have posted</Text>

      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          className="flex-1 border border-gray-200 bg-white rounded-full py-2"
          onPress={() => router.push("/rides/offer")}
        >
          <Text className="text-center text-gray-700 font-medium">Offer Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 border border-gray-200 bg-white rounded-full py-2"
          onPress={() => router.push("/rides/request")}
        >
          <Text className="text-center text-gray-700 font-medium">Request Ride</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.status}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeStatus === tab.status ? "bg-blue-600" : "bg-white"
            }`}
            onPress={() => setActiveStatus(tab.status)}
          >
            <Text
              className={`font-medium ${
                activeStatus === tab.status ? "text-white" : "text-gray-700"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500">Loading rides...</Text>
        </View>
      ) : error ? (
        <View className="bg-red-50 border border-red-100 rounded-xl p-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <CarIcon size={28} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-lg">No rides in this section</Text>
          <Text className="text-gray-400 text-sm mt-2">Post a ride to get started</Text>
          <TouchableOpacity
            className="mt-4 bg-blue-600 px-5 py-2 rounded-full"
            onPress={() => router.push("/rides/offer")}
          >
            <Text className="text-white font-semibold">Offer a ride</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filtered.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onPress={() => router.push(`/rides/detail?id=${ride.id}`)}
          />
        ))
      )}
    </ScrollView>
  );
}
