import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { roomsApi } from "@/lib/api/rooms";
import RoomMapCanvas from "@/components/rooms/RoomMapCanvas";
import { RoomListingSummary } from "@/types";

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
      <Text className="text-xl font-bold text-gray-900 mb-4">Map Discovery</Text>
      {loading ? (
        <Text className="text-gray-500">Loading map...</Text>
      ) : (
        <RoomMapCanvas listings={listings} onSelect={(listing) => router.push(`/rooms/detail?id=${listing.id}`)} />
      )}
    </View>
  );
}
