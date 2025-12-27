import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import BottomSheet from "@gorhom/bottom-sheet";
import { ridesApi } from "@/lib/api/rides";
import { RideFilters, RidePostSummary, RidePostType } from "@/types";
import RideCard from "@/components/rides/RideCard";
import RideFiltersSheet from "@/components/rides/RideFiltersSheet";
import RideMapCanvas from "@/components/rides/RideMapCanvas";
import { CarIcon, MapPinIcon, SearchIcon, FilterIcon, GridIcon, ListIcon, XIcon } from "@/components/ui/Icons";

const TAB_CONFIG: { label: string; type: RidePostType }[] = [
  { label: "Available Rides", type: "OFFER" },
  { label: "Ride Requests", type: "REQUEST" },
];

export default function RidesHome() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<RidePostType>("OFFER");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");
  const [rides, setRides] = useState<RidePostSummary[]>([]);
  const [filters, setFilters] = useState<RideFilters>({ type: "OFFER" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const sheetRef = useRef<BottomSheet>(null);

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleInitialSelection = (type: RidePostType) => {
    setActiveTab(type);
    setFilters((prev) => ({ ...prev, type }));
    setShowInitialPrompt(false);
  };

  const filteredRides = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return rides;
    return rides.filter((ride) =>
      [ride.title, ride.pickupLabel, ride.dropLabel]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(trimmed))
    );
  }, [rides, searchQuery]);

  const selectedRide = useMemo(
    () => filteredRides.find((ride) => ride.id === selectedRideId) ?? filteredRides[0],
    [filteredRides, selectedRideId]
  );

  const loadRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ridesApi.getPosts(filters);
      setRides(response.content || []);
      if (response.content?.length) {
        setSelectedRideId(response.content[0].id);
      }
    } catch {
      setError("Unable to load rides right now.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  const loadLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setFilters((prev) => ({
      ...prev,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    }));
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  useEffect(() => {
    if (filteredRides.length === 0) {
      setSelectedRideId(null);
      return;
    }

    if (!selectedRideId || !filteredRides.some((ride) => ride.id === selectedRideId)) {
      setSelectedRideId(filteredRides[0].id);
    }
  }, [filteredRides, selectedRideId]);

  useEffect(() => {
    loadLocation();
  }, []);


  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Initial Prompt Modal */}
      <Modal
        visible={showInitialPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center px-4"
          onPress={() => {}}
        >
          <Pressable
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-6 py-6">
              {/* Header */}
              <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  What are you looking for?
                </Text>
                <Text className="text-sm text-gray-600 mt-2 text-center">
                  Choose an option to get started
                </Text>
              </View>

              {/* Options */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => handleInitialSelection("OFFER")}
                  className="bg-blue-600 rounded-xl p-5 flex-row items-center shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <CarIcon size={28} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Looking for a Ride</Text>
                    <Text className="text-blue-100 text-sm mt-1">
                      Find available rides from drivers
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleInitialSelection("REQUEST")}
                  className="bg-indigo-600 rounded-xl p-5 flex-row items-center shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center mr-4">
                    <MapPinIcon size={28} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Providing a Ride</Text>
                    <Text className="text-indigo-100 text-sm mt-1">
                      Respond to ride requests from passengers
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Header with Search */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-3 pt-2 pb-3">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">Find Your Ride</Text>
              <Text className="text-xs text-gray-500 mt-0.5">Discover rides and carpool opportunities</Text>
            </View>
            {Platform.OS === 'web' && (
              <TouchableOpacity
                onPress={() => setShowActionModal(true)}
                className="bg-blue-600 px-4 py-2.5 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold text-sm">+ Create Ride</Text>
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
                placeholder="Search pickup, drop-off, or notes..."
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

          {/* Tab Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {TAB_CONFIG.map((tab) => (
              <TouchableOpacity
                key={tab.type}
                className={`px-4 py-2 rounded-full mr-3 ${
                  activeTab === tab.type ? "bg-blue-600" : "bg-gray-100"
                }`}
                onPress={() => setActiveTab(tab.type)}
              >
                <Text
                  className={`font-medium text-sm ${
                    activeTab === tab.type ? "text-white" : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {viewMode === "map" ? (
        <View className="flex-1 px-4 py-4">
          {filteredRides.length > 0 ? (
            <RideMapCanvas
              rides={filteredRides}
              onSelect={(ride) => {
                setSelectedRideId(ride.id);
                navigateTo(`/rides/detail?id=${ride.id}`);
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <CarIcon size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">No rides to display on map</Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ padding: viewMode === "grid" ? 12 : 8, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && (
            <View className="items-center py-20">
              <Text className="text-gray-500 text-base">Loading rides...</Text>
            </View>
          )}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 mt-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}
          {!loading && filteredRides.length === 0 && (
            <View className="items-center py-20 px-4">
              <CarIcon size={48} color="#9CA3AF" />
              <Text className="text-gray-700 text-xl font-semibold mt-4">No rides found</Text>
              <Text className="text-gray-500 mt-2 text-center text-sm">
                {searchQuery 
                  ? "Try adjusting your search or filters"
                  : "Be the first to post a ride in your area."}
              </Text>
              <TouchableOpacity
                onPress={() => navigateTo(activeTab === "OFFER" ? "/rides/offer" : "/rides/request")}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold">
                  {activeTab === "OFFER" ? "Offer a Ride" : "Request a Ride"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && filteredRides.length > 0 && (
            <View className={viewMode === "grid" ? "flex-row flex-wrap justify-between" : "px-2"}>
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  viewMode={viewMode}
                  onPress={() => {
                    setSelectedRideId(ride.id);
                    navigateTo(`/rides/detail?id=${ride.id}`);
                  }}
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
        <RideFiltersSheet
          sheetRef={sheetRef}
          initialFilters={filters}
          onApply={(updated) => {
            setFilters(updated);
            try {
              sheetRef.current?.close();
            } catch (error) {
              console.error("Error closing sheet:", error);
            }
          }}
          onClose={() => {
            try {
              sheetRef.current?.close();
            } catch (error) {
              console.error("Error closing sheet:", error);
            }
          }}
        />
      </BottomSheet>

      {/* Action Modal Popup for FAB */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-4"
          onPress={() => setShowActionModal(false)}
        >
          <Pressable
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-6 py-5">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-gray-900">
                  Create a Ride Post
                </Text>
                <TouchableOpacity
                  onPress={() => setShowActionModal(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <XIcon size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowActionModal(false);
                    navigateTo("/rides/offer");
                  }}
                  className="bg-blue-600 rounded-xl p-4 flex-row items-center shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <CarIcon size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base">Offer a Ride</Text>
                    <Text className="text-blue-100 text-sm mt-0.5">
                      Share your ride with others
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowActionModal(false);
                    navigateTo("/rides/request");
                  }}
                  className="bg-indigo-600 rounded-xl p-4 flex-row items-center shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="w-12 h-12 bg-indigo-500 rounded-full items-center justify-center mr-4">
                    <MapPinIcon size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-base">Request a Ride</Text>
                    <Text className="text-indigo-100 text-sm mt-0.5">
                      Find someone to share a ride with
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Action Button - Mobile Only */}
      {Platform.OS !== 'web' && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24 + insets.bottom,
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowActionModal(true)}
            activeOpacity={0.8}
            className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
            style={{
              backgroundColor: "#2563EB", // Blue color for rides
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 10,
            }}
          >
            <CarIcon size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
