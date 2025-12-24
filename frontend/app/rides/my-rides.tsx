import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ridesApi } from "@/lib/api/rides";
import { RidePostSummary, RideStatus } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { useRouter } from "expo-router";

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

  const filtered = useMemo(
    () => rides.filter((ride) => ride.status === activeStatus),
    [rides, activeStatus]
  );

  const loadRides = async () => {
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

  useEffect(() => {
    loadRides();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-5 py-5">
      <Text className="text-2xl font-bold text-gray-900 mb-4">My Rides</Text>

      <View className="flex-row bg-white rounded-full p-1 mb-4">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.status}
            className={`flex-1 py-2 rounded-full ${activeStatus === tab.status ? "bg-blue-600" : ""}`}
            onPress={() => setActiveStatus(tab.status)}
          >
            <Text
              className={`text-center text-xs font-semibold ${activeStatus === tab.status ? "text-white" : "text-gray-600"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          <Text className="text-gray-500">No rides in this section.</Text>
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
