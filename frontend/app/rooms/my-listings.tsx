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
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">My Listings</Text>
            <Text className="text-sm text-gray-500 mt-1">Manage your rooms in one place</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/rooms/create")}
            className="bg-blue-600 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">+ New</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full mr-3 ${
                activeTab.label === tab.label ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text className={`${activeTab.label === tab.label ? "text-white" : "text-gray-700"} font-medium`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && <Text className="text-gray-500">Loading listings...</Text>}
        {!loading && filteredListings.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-gray-500 text-lg">No listings in this section yet.</Text>
            <Text className="text-gray-400 mt-2">Post a room to get started.</Text>
          </View>
        )}

        {filteredListings.map((listing) => (
          <TouchableOpacity
            key={listing.id}
            onPress={() => router.push(`/rooms/detail?id=${listing.id}`)}
            className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-semibold text-gray-900">{listing.title}</Text>
                <Text className="text-gray-500 mt-1">{listing.approxAreaLabel}</Text>
              </View>
              <Text className="text-blue-600 font-semibold">₹{listing.rentMonthly}</Text>
            </View>
            <View className="flex-row items-center mt-3">
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-xs text-gray-700 font-medium">{listing.status}</Text>
              </View>
            </View>
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
