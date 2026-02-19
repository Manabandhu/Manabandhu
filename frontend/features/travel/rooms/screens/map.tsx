import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { roomsApi } from "@/lib/api/rooms";
import RoomMapCanvas from '@/features/travel/rooms/components/RoomMapCanvas";
import { RoomListingSummary } from '@/shared/types";

export default function RoomsMap() {
  const router = useRouter();
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await roomsApi.getListings();
        setListings(response.content || []);
      } catch (err) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View className="flex-1 bg-gray-50 px-5 py-6">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">Map Discovery</Text>
          <Text className="text-sm text-gray-500 mt-1">Browse rooms around you</Text>
        </View>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => router.push("/rooms")}
        >
          <Text className="text-white font-semibold">List view</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text className="text-gray-500">Loading map...</Text>
      ) : (
        <RoomMapCanvas listings={listings} onSelect={(listing) => router.push(`/rooms/detail?id=${listing.id}`)} />
      )}
    </View>
  );
}
