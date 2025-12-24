import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import BottomSheet from "@gorhom/bottom-sheet";
import { ridesApi } from "@/lib/api/rides";
import { RideFilters, RidePostSummary, RidePostType } from "@/types";
import RideCard from "@/components/rides/RideCard";
import RideFiltersSheet from "@/components/rides/RideFiltersSheet";
import RideMapPreview from "@/components/rides/RideMapPreview";
import { MapPinIcon } from "@/components/ui/Icons";

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
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const selectedRide = useMemo(
    () => rides.find((ride) => ride.id === selectedRideId) ?? rides[0],
    [rides, selectedRideId]
  );

  const loadRides = useCallback(async () => {
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

    if (rides.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 text-lg">No rides available</Text>
          <Text className="text-gray-400 text-sm mt-2">Be the first to post a ride!</Text>
        </View>
      );
    }

    return rides.map((ride) => (
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
      <View className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Rides</Text>
        <Text className="text-sm text-gray-500 mt-1">Discover offers and requests near you</Text>

        <View className="flex-row gap-3 mt-4">
          {TAB_CONFIG.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              className={`flex-1 py-2 rounded-full ${
                activeTab === tab.type ? "bg-blue-600" : "bg-gray-100"
              }`}
              onPress={() => setActiveTab(tab.type)}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  activeTab === tab.type ? "text-white" : "text-gray-600"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row gap-3 mt-3">
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            className={`flex-1 py-2 rounded-full ${
              viewMode === "list" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text className={`text-center font-medium ${viewMode === "list" ? "text-white" : "text-gray-600"}`}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("map")}
            className={`flex-1 py-2 rounded-full ${
              viewMode === "map" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text className={`text-center font-medium ${viewMode === "map" ? "text-white" : "text-gray-600"}`}>
              Map
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 border border-gray-200 rounded-lg py-2"
            onPress={() => sheetRef.current?.expand()}
          >
            <Text className="text-center text-gray-700">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-lg py-2"
            onPress={() =>
              router.push(activeTab === "OFFER" ? "/rides/offer" : "/rides/request")
            }
          >
            <Text className="text-center text-white font-semibold">
              {activeTab === "OFFER" ? "Offer Ride" : "Request Ride"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "list" ? (
        <ScrollView
          className="flex-1 px-5 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-gray-500">{rides.length} results</Text>
            <View className="flex-row items-center">
              <MapPinIcon size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-1 text-sm">Nearby</Text>
            </View>
          </View>
          {renderContent()}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-5 py-4">
          {selectedRide ? (
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
            <Text className="text-sm text-gray-500">{rides.length} results</Text>
          </View>
          {renderContent()}
        </ScrollView>
      )}

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
