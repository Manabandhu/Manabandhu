import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import RoomFiltersBottomSheet from "@/components/rooms/RoomFiltersBottomSheet";
import RoomListingCard from "@/components/rooms/RoomListingCard";
import RoomMapCanvas from "@/components/rooms/RoomMapCanvas";
import { roomsApi } from "@/lib/api/rooms";
import { RoomFilters, RoomListingSummary } from "@/types";
import { HomeIcon, SearchIcon, MapPinIcon, FilterIcon, GridIcon, ListIcon } from "@/components/ui/Icons";

export default function RoomFinderHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab = tab === "map" ? "map" : "list";
  const [activeTab, setActiveTab] = useState<"list" | "map">(initialTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState<RoomFilters>({});
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadListings(filters);
  }, [filters]);

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title?.toLowerCase().includes(query) ||
      listing.approxAreaLabel?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header with Search */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-4 pt-3 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">Find Your Room</Text>
              <Text className="text-sm text-gray-500 mt-1">Discover rooms and homes near you</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/rooms/create")}
              className="bg-indigo-600 px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Text className="text-white font-semibold text-sm">+ Post</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center mb-3 border border-gray-200">
            <SearchIcon size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by location, room type..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-900 text-base"
              returnKeyType="search"
            />
          </View>

          {/* Quick Filters and View Toggle */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2 flex-1">
              <TouchableOpacity
                onPress={() => sheetRef.current?.expand()}
                className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-2.5"
              >
                <FilterIcon size={18} color="#4B5563" />
                <Text className="text-gray-700 font-medium ml-2 text-sm">Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/rooms/my-listings")}
                className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2.5"
              >
                <Text className="text-gray-700 font-medium text-sm">My Listings</Text>
          </TouchableOpacity>
        </View>

            {activeTab === "list" && (
              <View className="flex-row bg-gray-100 rounded-lg p-1 ml-2">
                <TouchableOpacity
                  onPress={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                >
                  <ListIcon size={18} color={viewMode === "list" ? "#4F46E5" : "#6B7280"} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                >
                  <GridIcon size={18} color={viewMode === "grid" ? "#4F46E5" : "#6B7280"} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tab Toggle */}
          <View className="flex-row gap-2 mt-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("list")}
              className={`flex-1 py-2.5 rounded-lg ${activeTab === "list" ? "bg-white shadow-sm" : ""}`}
          >
              <Text className={`text-center font-semibold ${activeTab === "list" ? "text-indigo-600" : "text-gray-600"}`}>
                List View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("map")}
              className={`flex-1 py-2.5 rounded-lg ${activeTab === "map" ? "bg-white shadow-sm" : ""}`}
          >
              <Text className={`text-center font-semibold ${activeTab === "map" ? "text-indigo-600" : "text-gray-600"}`}>
                Map View
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {activeTab === "list" ? (
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: viewMode === "grid" ? 12 : 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && (
            <View className="items-center py-20">
              <Text className="text-gray-500 text-base">Loading listings...</Text>
            </View>
          )}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 mt-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}
          {!loading && filteredListings.length === 0 && (
            <View className="items-center py-20 px-4">
              <HomeIcon size={48} color="#9CA3AF" />
              <Text className="text-gray-700 text-xl font-semibold mt-4">No listings found</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery 
                  ? "Try adjusting your search or filters"
                  : "Be the first to post a room in your neighborhood."}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/rooms/create")}
                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold">Post a listing</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && filteredListings.length > 0 && (
            <View className={viewMode === "grid" ? "flex-row flex-wrap justify-between" : ""}>
              {filteredListings.map((listing) => (
            <RoomListingCard
              key={listing.id}
              listing={listing}
                  viewMode={viewMode}
              onPress={() => router.push(`/rooms/detail?id=${listing.id}`)}
            />
          ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1">
          <RoomMapCanvas listings={filteredListings} onSelect={(listing) => router.push(`/rooms/detail?id=${listing.id}`)} />
        </View>
      )}

      {isMounted && (
        <RoomFiltersBottomSheet
          sheetRef={sheetRef as React.RefObject<BottomSheet>}
          initialFilters={filters}
          onClose={() => {
            try {
              sheetRef.current?.close();
            } catch (error) {
              console.error("Error closing sheet:", error);
            }
          }}
          onApply={(next) => {
            setFilters(next);
            try {
              sheetRef.current?.close();
            } catch (error) {
              console.error("Error closing sheet:", error);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
