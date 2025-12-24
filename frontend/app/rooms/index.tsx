import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import RoomFiltersBottomSheet from "@/components/rooms/RoomFiltersBottomSheet";
import RoomListingCard from "@/components/rooms/RoomListingCard";
import RoomMapCanvas from "@/components/rooms/RoomMapCanvas";
import { roomsApi } from "@/lib/api/rooms";
import { RoomFilters, RoomListingSummary } from "@/types";

export default function RoomFinderHome() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab = tab === "map" ? "map" : "list";
  const [activeTab, setActiveTab] = useState<"list" | "map">(initialTab);
  const [filters, setFilters] = useState<RoomFilters>({});
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const loadListings = async (currentFilters = filters) => {
    setError(null);
    setLoading(true);
    try {
      const response = await roomsApi.getListings(currentFilters);
      setListings(response.content || []);
    } catch (err) {
      setError("Unable to load listings right now.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadListings(filters);
  }, [filters]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Room Finder</Text>
        <Text className="text-sm text-gray-500 mt-1">Find rooms and homes near you</Text>
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("list")}
            className={`flex-1 py-2 rounded-full ${activeTab === "list" ? "bg-blue-600" : "bg-gray-100"}`}
          >
            <Text className={`text-center font-medium ${activeTab === "list" ? "text-white" : "text-gray-600"}`}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("map")}
            className={`flex-1 py-2 rounded-full ${activeTab === "map" ? "bg-blue-600" : "bg-gray-100"}`}
          >
            <Text className={`text-center font-medium ${activeTab === "map" ? "text-white" : "text-gray-600"}`}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => sheetRef.current?.expand()}
            className="flex-1 border border-gray-200 rounded-lg py-2"
          >
            <Text className="text-center text-gray-600">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/rooms/create")}
            className="flex-1 bg-blue-600 rounded-lg py-2"
          >
            <Text className="text-center text-white font-semibold">Post Listing</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "list" ? (
        <ScrollView
          className="flex-1 px-5 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && <Text className="text-gray-500">Loading listings...</Text>}
          {error && <Text className="text-red-500 mb-3">{error}</Text>}
          {!loading && listings.length === 0 && (
            <View className="items-center py-20">
              <Text className="text-gray-500 text-lg">No listings yet</Text>
              <Text className="text-gray-400 mt-2">Be the first to post a room.</Text>
            </View>
          )}
          {listings.map((listing) => (
            <RoomListingCard
              key={listing.id}
              listing={listing}
              onPress={() => router.push(`/rooms/detail?id=${listing.id}`)}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 py-4">
          <RoomMapCanvas listings={listings} onSelect={(listing) => router.push(`/rooms/detail?id=${listing.id}`)} />
        </View>
      )}

      <RoomFiltersBottomSheet
        sheetRef={sheetRef}
        initialFilters={filters}
        onClose={() => sheetRef.current?.close()}
        onApply={(next) => {
          setFilters(next);
          sheetRef.current?.close();
        }}
      />
    </View>
  );
}
