import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RideMapPreview from "@/components/rides/RideMapPreview";
import RideStatusBadge from "@/components/rides/RideStatusBadge";
import { ridesApi } from "@/lib/api/rides";
import { formatDepartTime, hoursUntil } from "@/lib/rides/format";
import { RidePost } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export default function RideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<RidePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const bookRide = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await ridesApi.bookPost(id);
      setRide(updated);
    } catch {
      setError("Unable to book this ride.");
    } finally {
      setActionLoading(false);
    }
  };

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
    <ScrollView className="flex-1 bg-white px-6 py-6">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-gray-900">
            {ride.pickupLabel} → {ride.dropLabel}
          </Text>
          {ride.title ? (
            <Text className="text-sm text-gray-600 mt-1">{ride.title}</Text>
          ) : null}
        </View>
        <RideStatusBadge status={ride.status} />
      </View>

      <RideMapPreview
        pickup={{ lat: ride.pickupLat, lng: ride.pickupLng, color: "#10B981" }}
        drop={{ lat: ride.dropLat, lng: ride.dropLng, color: "#F97316" }}
      />

      <View className="bg-gray-50 rounded-2xl p-4 mt-5">
        <Text className="text-sm text-gray-500">Departure</Text>
        <Text className="text-lg font-semibold text-gray-900">{formatDepartTime(ride.departAt)}</Text>
        <View className="flex-row justify-between mt-3">
          <View>
            <Text className="text-sm text-gray-500">Distance</Text>
            <Text className="text-base font-semibold text-gray-900">{ride.routeDistanceMiles.toFixed(1)} mi</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Price</Text>
            <Text className="text-base font-semibold text-gray-900">${ride.priceTotal.toFixed(2)}</Text>
          </View>
        </View>
        {expiresIn !== null && ride.status === "OPEN" ? (
          <Text className="text-xs text-gray-500 mt-3">Expires in {expiresIn} hours</Text>
        ) : null}
      </View>

      <View className="mt-5">
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
        <View className="bg-red-50 border border-red-100 rounded-xl p-3 mt-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}

      <View className="mt-6 space-y-3">
        {!isOwner && !isBooked && canBook ? (
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-3"
            onPress={bookRide}
            disabled={actionLoading}
          >
            <Text className="text-white text-center font-semibold">Book Ride</Text>
          </TouchableOpacity>
        ) : null}

        {!isOwner ? (
          <TouchableOpacity
            className="bg-gray-900 rounded-xl py-3"
            onPress={startChat}
            disabled={actionLoading}
          >
            <Text className="text-white text-center font-semibold">Chat</Text>
          </TouchableOpacity>
        ) : null}

        {isOwner ? (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl py-3"
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
            className="bg-purple-600 rounded-xl py-3"
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
    </ScrollView>
  );
}
