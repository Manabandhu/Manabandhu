import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import BottomSheet from "@gorhom/bottom-sheet";
import { ridesApi } from "@/lib/api/rides";
import { RideFilters, RidePostSummary, RidePostType } from "@/types";
import RideCard from "@/components/rides/RideCard";
import RideFiltersSheet from "@/components/rides/RideFiltersSheet";
import RideMapPreview from "@/components/rides/RideMapPreview";
import { CarIcon, MapPinIcon, SearchIcon } from "@/components/ui/Icons";

const TAB_CONFIG: { label: string; type: RidePostType }[] = [
  { label: "Available Rides", type: "OFFER" },
  { label: "Ride Requests", type: "REQUEST" },
];

export default function RidesHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RidePostType>("OFFER");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [rides, setRides] = useState<RidePostSummary[]>([]);
  const [filters, setFilters] = useState<RideFilters>({ type: "OFFER" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

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

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500">Loading rides...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="bg-red-50 border border-red-100 rounded-xl p-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      );
    }

    if (filteredRides.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <CarIcon size={28} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-lg">No rides available</Text>
          <Text className="text-gray-400 text-sm mt-2">Try updating your filters or search</Text>
        </View>
      );
    }

    return filteredRides.map((ride) => (
      <RideCard
        key={ride.id}
        ride={ride}
        onPress={() => {
          setSelectedRideId(ride.id);
          router.push(`/rides/detail?id=${ride.id}`);
        }}
      />
    ));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 bg-gray-50 px-4 py-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold text-gray-900">Rides</Text>
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-full"
            onPress={() =>
              router.push(activeTab === "OFFER" ? "/rides/offer" : "/rides/request")
            }
          >
            <Text className="text-white font-semibold">
              {activeTab === "OFFER" ? "+ Offer" : "+ Request"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-500 mb-5">Discover offers and requests near you</Text>

        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search pickup, drop-off, or notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {TAB_CONFIG.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              className={`px-4 py-2 rounded-full mr-3 ${
                activeTab === tab.type ? "bg-blue-600" : "bg-white"
              }`}
              onPress={() => setActiveTab(tab.type)}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab.type ? "text-white" : "text-gray-700"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row items-center gap-3 mb-5">
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-full px-4 py-2"
            onPress={() => sheetRef.current?.expand()}
          >
            <Text className="text-gray-700 font-medium">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-full px-4 py-2"
            onPress={() => router.push("/rides/my-rides")}
          >
            <Text className="text-gray-700 font-medium">My Rides</Text>
          </TouchableOpacity>
          <View className="ml-auto flex-row bg-gray-100 rounded-full p-1">
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "list" ? "bg-white" : ""
              }`}
            >
              <Text className={`text-sm font-medium ${viewMode === "list" ? "text-gray-900" : "text-gray-500"}`}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("map")}
              className={`px-3 py-1 rounded-full ${
                viewMode === "map" ? "bg-white" : ""
              }`}
            >
              <Text className={`text-sm font-medium ${viewMode === "map" ? "text-gray-900" : "text-gray-500"}`}>
                Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === "map" && selectedRide ? (
          <View className="mb-4">
            <RideMapPreview
              pickup={{
                lat: selectedRide.pickupLat,
                lng: selectedRide.pickupLng,
                color: "#10B981",
              }}
              drop={{
                lat: selectedRide.dropLat,
                lng: selectedRide.dropLng,
                color: "#F97316",
              }}
            />
          </View>
        ) : null}

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-gray-500">{filteredRides.length} results</Text>
          <View className="flex-row items-center">
            <MapPinIcon size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1 text-sm">Nearby</Text>
          </View>
        </View>
        {renderContent()}
      </ScrollView>

      <RideFiltersSheet
        sheetRef={sheetRef}
        initialFilters={filters}
        onApply={(updated) => {
          setFilters(updated);
          sheetRef.current?.close();
        }}
        onClose={() => sheetRef.current?.close()}
      />
    </View>
  );
}
