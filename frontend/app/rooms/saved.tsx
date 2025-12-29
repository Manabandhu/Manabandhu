import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/ui/Header";
import RoomListingCard from "@/components/rooms/RoomListingCard";
import { roomsApi } from "@/lib/api/rooms";
import { RoomListingSummary } from "@/types";
import { HomeIcon } from "@/components/ui/Icons";

export default function SavedListings() {
  const router = useRouter();
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedListings = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await roomsApi.getSavedListings();
      setListings(response.content || []);
    } catch (err) {
      setError("Unable to load saved listings.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedListings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSavedListings();
  }, []);

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <Header title="Saved Listings" />
      
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        contentContainerStyle={{ padding: 8, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View className="items-center py-20">
            <Text className="text-gray-500 text-base">Loading saved listings...</Text>
          </View>
        )}
        
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 mt-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}
        
        {!loading && listings.length === 0 && (
          <View className="items-center py-20 px-4">
            <HomeIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold mt-4">
              No saved listings
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">
              Start saving listings you're interested in to view them here.
            </Text>
            <TouchableOpacity
              onPress={() => navigateTo("/rooms")}
              className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-sm"
            >
              <Text className="text-white font-semibold">Browse Listings</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!loading && listings.length > 0 && (
          <View className="px-2">
            <View className="mb-4 px-2">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {listings.length} {listings.length === 1 ? 'listing' : 'listings'} saved
              </Text>
            </View>
            {listings.map((listing) => (
              <RoomListingCard
                key={listing.id}
                listing={listing}
                viewMode="list"
                onPress={() => navigateTo(`/rooms/detail?id=${listing.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

