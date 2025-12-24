import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { roomsApi } from "@/lib/api/rooms";
import { ListingStatus, RoomListingSummary } from "@/types";

const TABS: { label: string; statuses: ListingStatus[] }[] = [
  { label: "Active", statuses: ["AVAILABLE"] },
  { label: "In Talks", statuses: ["IN_TALKS"] },
  { label: "Hidden", statuses: ["HIDDEN"] },
  { label: "Archived", statuses: ["ARCHIVED"] },
];

export default function MyListings() {
  const router = useRouter();
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    try {
      const response = await roomsApi.getMyListings();
      setListings(response.content || []);
    } catch (err) {
      Alert.alert("Unable to load listings", "Please try again.");
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
    loadListings();
  }, []);

  const filteredListings = listings.filter((listing) => activeTab.statuses.includes(listing.status));

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">My Listings</Text>
        <View className="flex-row flex-wrap gap-2 mt-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full border ${
                activeTab.label === tab.label ? "bg-blue-600 border-blue-600" : "border-gray-200"
              }`}
            >
              <Text className={`${activeTab.label === tab.label ? "text-white" : "text-gray-600"}`}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && <Text className="text-gray-500">Loading listings...</Text>}
        {!loading && filteredListings.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-gray-500">No listings in this section yet.</Text>
          </View>
        )}

        {filteredListings.map((listing) => (
          <TouchableOpacity
            key={listing.id}
            onPress={() => router.push(`/rooms/detail?id=${listing.id}`)}
            className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm"
          >
            <Text className="text-lg font-semibold text-gray-900">{listing.title}</Text>
            <Text className="text-gray-500 mt-1">{listing.approxAreaLabel}</Text>
            <Text className="text-gray-600 mt-2">Status: {listing.status}</Text>
            {listing.status === "HIDDEN" && (
              <View className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <Text className="text-sm text-yellow-700">Hidden due to inactivity.</Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await roomsApi.repostListing(listing.id);
                      await loadListings();
                    } catch (err) {
                      Alert.alert("Unable to repost", "Please try again.");
                    }
                  }}
                  className="mt-2 bg-blue-600 rounded-lg py-2"
                >
                  <Text className="text-white text-center text-sm font-semibold">Repost listing</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
