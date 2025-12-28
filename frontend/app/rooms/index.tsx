import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/ui/Header";
import BottomSheet from "@gorhom/bottom-sheet";
import RoomFiltersBottomSheet from "@/components/rooms/RoomFiltersBottomSheet";
import RoomListingCard from "@/components/rooms/RoomListingCard";
import RoomMapCanvas from "@/components/rooms/RoomMapCanvas";
import { roomsApi } from "@/lib/api/rooms";
import { RoomFilters, RoomListingSummary } from "@/types";
import { HomeIcon, SearchIcon, MapPinIcon, FilterIcon, GridIcon, ListIcon, PlusIcon } from "@/components/ui/Icons";

export default function RoomFinderHome() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");
  const [filters, setFilters] = useState<RoomFilters>({});
  const [listings, setListings] = useState<RoomListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sheetRef = useRef<BottomSheet>(null);

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

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

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title?.toLowerCase().includes(query) ||
      listing.approxAreaLabel?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Rooms" />
      
      {/* Header with Search */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-3 pt-2 pb-3">
          <View className="mb-3 flex-row items-center justify-end">
            {Platform.OS === 'web' && (
              <TouchableOpacity
                onPress={() => navigateTo("/rooms/create")}
                className="bg-indigo-600 px-4 py-2.5 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold text-sm">+ Post Room</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar with Filters and View Toggle */}
          <View className="flex-row items-center gap-1.5">
            <View className="bg-gray-50 rounded-lg px-3 flex-row items-center border border-gray-200" style={{ flex: 2.5, height: 44 }}>
              <SearchIcon size={18} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-gray-900 text-sm"
                returnKeyType="search"
              />
            </View>
            
            <TouchableOpacity
              onPress={() => {
                try {
                  sheetRef.current?.snapToIndex(0);
                } catch (error) {
                  console.error("Error opening sheet:", error);
                }
              }}
              className="flex-row items-center bg-white border border-gray-300 rounded-lg px-2.5"
              style={{ height: 44 }}
            >
              <FilterIcon size={16} color="#4B5563" />
            </TouchableOpacity>

            <View className="flex-row bg-gray-100 rounded-lg p-0.5 items-center" style={{ height: 44, flex: 1.3 }}>
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`flex-1 h-full rounded-md items-center justify-center ${viewMode === "list" ? "bg-white" : ""}`}
              >
                <ListIcon size={16} color={viewMode === "list" ? "#4F46E5" : "#6B7280"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                className={`flex-1 h-full rounded-md items-center justify-center ${viewMode === "grid" ? "bg-white" : ""}`}
              >
                <GridIcon size={16} color={viewMode === "grid" ? "#4F46E5" : "#6B7280"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("map")}
                className={`flex-1 h-full rounded-md items-center justify-center ${viewMode === "map" ? "bg-white" : ""}`}
              >
                <MapPinIcon size={16} color={viewMode === "map" ? "#4F46E5" : "#6B7280"} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>

      {viewMode === "map" ? (
        <View className="flex-1">
          <RoomMapCanvas listings={filteredListings} onSelect={(listing) => navigateTo(`/rooms/detail?id=${listing.id}`)} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: viewMode === "grid" ? 12 : 8, paddingBottom: 20 }}
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
                onPress={() => navigateTo("/rooms/create")}
                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold">Post a listing</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && filteredListings.length > 0 && (
            <View className={viewMode === "grid" ? "flex-row flex-wrap justify-between" : "px-2"}>
              {filteredListings.map((listing) => (
            <RoomListingCard
              key={listing.id}
              listing={listing}
                  viewMode={viewMode}
              onPress={() => navigateTo(`/rooms/detail?id=${listing.id}`)}
            />
          ))}
            </View>
          )}
        </ScrollView>
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={["25%", "60%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#fff" }}
      >
        <RoomFiltersBottomSheet
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
          sheetRef={sheetRef as React.RefObject<BottomSheet>}
        />
      </BottomSheet>

      {/* Floating Action Button - Mobile Only (Rooms specific styling) */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity
          onPress={() => navigateTo("/rooms/create")}
          className="absolute right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          style={{
            bottom: 24 + insets.bottom,
            backgroundColor: "#10B981", // Green color for rooms/housing
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 10,
          }}
        >
          <HomeIcon size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
