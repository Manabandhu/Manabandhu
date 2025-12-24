import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

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

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-3xl font-bold text-gray-900">Rides</Text>
          <Text className="text-sm text-gray-500">Discover offers and requests near you.</Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-white border border-gray-200 px-3 py-2 rounded-full"
            onPress={() => setShowFilters(true)}
          >
            <Text className="text-sm font-semibold text-gray-700">Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-600 px-3 py-2 rounded-full"
            onPress={() =>
              router.push(activeTab === "OFFER" ? "/rides/offer" : "/rides/request")
            }
          >
            <Text className="text-sm font-semibold text-white">
              {activeTab === "OFFER" ? "+ Offer" : "+ Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row bg-white rounded-full p-1 mb-4">
        {TAB_CONFIG.map((tab) => (
          <TouchableOpacity
            key={tab.type}
            className={`flex-1 py-2 rounded-full ${activeTab === tab.type ? "bg-blue-600" : ""}`}
            onPress={() => setActiveTab(tab.type)}
          >
            <Text
              className={`text-center text-sm font-semibold ${activeTab === tab.type ? "text-white" : "text-gray-600"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm text-gray-500">{rides.length} results</Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
        >
          <MapPinIcon size={16} color="#2563EB" />
          <Text className="text-blue-600 ml-1 text-sm font-semibold">
            {viewMode === "list" ? "Map" : "List"}
          </Text>
        </TouchableOpacity>
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

      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500">Loading rides...</Text>
        </View>
      ) : error ? (
        <View className="bg-red-50 border border-red-100 rounded-xl p-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : rides.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 text-lg">No rides available</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Be the first to post a ride!
          </Text>
        </View>
      ) : (
        rides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onPress={() => {
              setSelectedRideId(ride.id);
              router.push(`/rides/detail?id=${ride.id}`);
            }}
          />
        ))
      )}

      <RideFiltersSheet
        visible={showFilters}
        filters={filters}
        onApply={(updated) => {
          setFilters(updated);
        }}
        onClose={() => setShowFilters(false)}
      />
    </ScrollView>
  );
}
