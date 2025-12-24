import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import RideMapPreview from "@/components/rides/RideMapPreview";
import { ridesApi } from "@/lib/api/rides";
import { RidePost, RideTrackingSession } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export default function TrackingMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore.getState().user?.uid;
  const [ride, setRide] = useState<RidePost | null>(null);
  const [tracking, setTracking] = useState<RideTrackingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadRide = async () => {
    if (!id) return;
    try {
      const response = await ridesApi.getPost(id);
      setRide(response);
    } catch {
      setError("Unable to load ride tracking.");
    }
  };

  const refreshTracking = async () => {
    if (!id) return;
    try {
      const response = await ridesApi.getTracking(id);
      setTracking(response);
    } catch {
      if (!sharing) {
        setError("Tracking session is not available yet.");
      }
    }
  };

  const startSharing = async () => {
    if (!id) return;
    setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission is required to share live updates.");
      return;
    }
    await ridesApi.startTracking(id);
    setSharing(true);
    intervalRef.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const session = await ridesApi.updateLocation(id, location.coords.latitude, location.coords.longitude);
        setTracking(session);
      } catch {
        setError("Unable to send live location.");
      }
    }, 8000);
  };

  const stopSharing = async () => {
    if (!id) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    await ridesApi.endTracking(id);
    setSharing(false);
  };

  useEffect(() => {
    loadRide();
    refreshTracking();
    const poll = setInterval(refreshTracking, 10000);
    return () => {
      clearInterval(poll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  if (!ride) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading tracking...</Text>
      </View>
    );
  }

  const isDriver =
    tracking?.driverUserId === currentUserId ||
    (ride.postType === "OFFER" ? ride.ownerUserId === currentUserId : ride.bookedByUserId === currentUserId);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 py-5 gap-5">
        <Text className="text-2xl font-bold text-gray-900">Live Tracking</Text>

        <RideMapPreview
          pickup={{ lat: ride.pickupLat, lng: ride.pickupLng, color: "#10B981" }}
          drop={{ lat: ride.dropLat, lng: ride.dropLng, color: "#F97316" }}
          driver={
            tracking?.lastLat !== null &&
            tracking?.lastLat !== undefined &&
            tracking?.lastLng !== null &&
            tracking?.lastLng !== undefined
              ? { lat: tracking.lastLat, lng: tracking.lastLng, color: "#2563EB" }
              : undefined
          }
          height={260}
        />

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500">Driver ETA</Text>
          <Text className="text-xl font-semibold text-gray-900">
            {tracking?.etaMinutes ? `${tracking.etaMinutes} min` : "Calculating"}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">Distance remaining</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {tracking?.distanceRemainingMiles ? `${tracking.distanceRemainingMiles.toFixed(1)} mi` : "--"}
          </Text>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-100 rounded-xl p-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        {isDriver ? (
          <TouchableOpacity
            className={`rounded-xl py-3 ${sharing ? "bg-rose-600" : "bg-emerald-600"}`}
            onPress={sharing ? stopSharing : startSharing}
          >
            <Text className="text-white text-center font-semibold">
              {sharing ? "Stop sharing" : "Start sharing"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
