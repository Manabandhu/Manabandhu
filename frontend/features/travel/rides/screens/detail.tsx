import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RideMapView from "@/features/travel/rides/components/RideMapView";
import RideStatusBadge from "@/features/travel/rides/components/RideStatusBadge";
import { ridesApi } from "@/features/travel/rides/api";
import { formatDepartTime, hoursUntil } from "@/features/travel/rides/api/format";
import { RidePost } from "@/shared/types";
import { useAuthStore } from "@/store/auth.store";

export default function RideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<RidePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const currentUserId = useAuthStore.getState().user?.uid;

  const isOwner = useMemo(() => ride?.ownerUserId === currentUserId, [ride, currentUserId]);
  const isBooked = ride?.status === "BOOKED";
  const canBook = ride?.status === "OPEN" || ride?.status === "IN_TALKS";
  const isParticipant = isOwner || ride?.bookedByUserId === currentUserId;

  const loadRide = async () => {
    if (!id) return;
    setError(null);
    try {
      const response = await ridesApi.getPost(id);
      setRide(response);
    } catch {
      setError("Unable to load ride details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRide();
  }, [id]);

  const startChat = async () => {
    if (!id || !ride) return;
    setActionLoading(true);
    try {
      const response = await ridesApi.startChat(id);
      router.push(`/chat/conversation?chatId=${response.chatThreadId}&name=${encodeURIComponent(ride.pickupLabel)}&ridePostId=${id}`);
    } catch {
      setError("Unable to start chat.");
    } finally {
      setActionLoading(false);
    }
  };

  const requestRide = async () => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await ridesApi.bookPost(id);
      setRide(updated);
      setSuccess("Ride request sent! The driver will be notified.");
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Unable to request this ride. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Alias for backward compatibility
  const bookRide = requestRide;

  const cancelRide = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await ridesApi.cancelPost(id);
      await loadRide();
    } catch {
      setError("Unable to cancel this ride.");
    } finally {
      setActionLoading(false);
    }
  };

  const repostRide = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await ridesApi.repostPost(id);
      setRide(updated);
    } catch {
      setError("Unable to repost this ride.");
    } finally {
      setActionLoading(false);
    }
  };

  const rebookRide = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await ridesApi.rebookPost(id);
      router.replace(`/rides/detail?id=${updated.id}`);
    } catch {
      setError("Unable to rebook this ride.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading ride...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Ride not found.</Text>
      </View>
    );
  }

  const expiresIn = hoursUntil(ride.expiresAt);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-5 py-5 gap-5">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-bold text-gray-900">
                {ride.pickupLabel} → {ride.dropLabel}
              </Text>
              {ride.title ? (
                <Text className="text-sm text-gray-600 mt-1">{ride.title}</Text>
              ) : null}
            </View>
            <View className="items-end">
              <RideStatusBadge status={ride.status} />
              {expiresIn !== null && ride.status === "OPEN" ? (
                <Text className="text-xs text-gray-500 mt-1">Expires in {expiresIn} hours</Text>
              ) : null}
            </View>
          </View>
        </View>

        <RideMapView
          ride={ride}
          height={300}
          showRoute={true}
        />

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500">Departure</Text>
          <Text className="text-lg font-semibold text-gray-900">{formatDepartTime(ride.departAt)}</Text>
          <View className="flex-row justify-between mt-3">
            <View>
              <Text className="text-sm text-gray-500">Distance</Text>
              <Text className="text-base font-semibold text-gray-900">
                {ride.routeDistanceMiles.toFixed(1)} mi
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Price</Text>
              <Text className="text-base font-semibold text-gray-900">
                ${ride.priceTotal.toFixed(2)}
              </Text>
            </View>
            {ride.requestCount !== undefined && ride.requestCount !== null && ride.requestCount > 0 ? (
              <View>
                <Text className="text-sm text-gray-500">Requests</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {ride.requestCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-sm text-gray-500">Requirements</Text>
          <Text className="text-base text-gray-900 mt-1">
            People: {ride.requirements?.peopleCount ?? 1}
          </Text>
          <Text className="text-base text-gray-900 mt-1">
            Luggage: {ride.requirements?.luggage ? "Allowed" : "No"}
          </Text>
          <Text className="text-base text-gray-900 mt-1">
            Pets: {ride.requirements?.pets ? "Allowed" : "No"}
          </Text>
          {ride.requirements?.notes ? (
            <Text className="text-sm text-gray-500 mt-2">{ride.requirements.notes}</Text>
          ) : null}
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-100 rounded-xl p-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}
        
        {success ? (
          <View className="bg-green-50 border border-green-100 rounded-xl p-3">
            <Text className="text-green-600 text-sm">{success}</Text>
          </View>
        ) : null}

        <View className="space-y-3">
          {!isOwner && !isBooked && canBook ? (
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3"
              onPress={requestRide}
              disabled={actionLoading}
            >
              <Text className="text-white text-center font-semibold">
                {actionLoading ? "Requesting..." : "Request Ride"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {!isOwner ? (
            <TouchableOpacity
              className="border border-blue-600 rounded-xl py-3"
              onPress={startChat}
              disabled={actionLoading}
            >
              <Text className="text-blue-600 text-center font-semibold">Chat</Text>
            </TouchableOpacity>
          ) : null}

          {isOwner ? (
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 border border-gray-200 rounded-xl py-3"
                onPress={() => router.push(`/rides/edit/${ride.id}`)}
                disabled={actionLoading}
              >
                <Text className="text-center text-gray-800 font-semibold">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-rose-600 rounded-xl py-3"
                onPress={cancelRide}
                disabled={actionLoading}
              >
                <Text className="text-center text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {isOwner && ride.status === "ARCHIVED" ? (
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3"
              onPress={repostRide}
              disabled={actionLoading}
            >
              <Text className="text-white text-center font-semibold">Repost Ride</Text>
            </TouchableOpacity>
          ) : null}

          {isOwner && ride.status === "BOOKED" ? (
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3"
              onPress={rebookRide}
              disabled={actionLoading}
            >
              <Text className="text-white text-center font-semibold">Rebook Ride</Text>
            </TouchableOpacity>
          ) : null}

          {ride.status === "BOOKED" && isParticipant ? (
            <TouchableOpacity
              className="bg-emerald-600 rounded-xl py-3"
              onPress={() => router.push(`/rides/tracking/${ride.id}`)}
            >
              <Text className="text-white text-center font-semibold">Tracking</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
