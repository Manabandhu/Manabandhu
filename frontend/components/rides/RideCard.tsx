import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { RidePostSummary } from "@/types";
import RideStatusBadge from "@/components/rides/RideStatusBadge";
import { formatDepartTime, hoursUntil } from "@/lib/rides/format";
import { MapPinIcon, UsersIcon, CarIcon } from "@/components/ui/Icons";
import { useCurrency } from "@/lib/currency";

interface RideCardProps {
  ride: RidePostSummary;
  viewMode?: "list" | "grid";
  onPress?: () => void;
}

export default function RideCard({ ride, onPress, viewMode = "list" }: RideCardProps) {
  const expiresIn = hoursUntil(ride.expiresAt);
  const { format } = useCurrency();

  if (viewMode === "grid") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl border border-gray-200 shadow-md mb-3 overflow-hidden"
        style={{ width: "48%" }}
        activeOpacity={0.7}
      >
        <View className="relative bg-blue-50 p-4" style={{ minHeight: 120 }}>
          <View className="absolute top-3 right-3">
            <RideStatusBadge status={ride.status} />
          </View>
          <View className="flex-1 justify-center">
            <View className="flex-row items-center mb-2">
              <MapPinIcon size={14} color="#10B981" />
              <Text className="text-xs text-gray-700 ml-1 flex-1" numberOfLines={1}>
                {ride.pickupLabel}
              </Text>
            </View>
            <View className="w-4 h-4 items-center justify-center my-1">
              <View className="w-0.5 h-4 bg-gray-400" />
            </View>
            <View className="flex-row items-center">
              <MapPinIcon size={14} color="#F97316" />
              <Text className="text-xs text-gray-700 ml-1 flex-1" numberOfLines={1}>
                {ride.dropLabel}
              </Text>
            </View>
          </View>
        </View>
        <View className="p-3">
          {ride.title ? (
            <Text className="text-sm font-semibold text-gray-900 mb-2" numberOfLines={1}>
              {ride.title}
            </Text>
          ) : null}
          <View className="flex-row items-baseline justify-between mb-2">
            <Text className="text-lg font-bold text-blue-600">{format(ride.priceTotal)}</Text>
            <Text className="text-xs text-gray-500">{formatDepartTime(ride.departAt)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            {ride.seatsTotal ? (
              <View className="flex-row items-center">
                <UsersIcon size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">{ride.seatsTotal} seats</Text>
              </View>
            ) : ride.seatsNeeded ? (
              <View className="flex-row items-center">
                <UsersIcon size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">{ride.seatsNeeded} needed</Text>
              </View>
            ) : null}
            {expiresIn !== null && ride.status === "OPEN" ? (
              <Text className="text-xs text-gray-500">Expires {expiresIn}h</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List View (Horizontal Card)
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-3 overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="flex-row" style={{ minHeight: 140 }}>
        <View className="relative bg-blue-50 items-center justify-center" style={{ width: 100, height: 140 }}>
          <CarIcon size={32} color="#2563EB" />
          <View className="absolute top-2 left-2">
            <RideStatusBadge status={ride.status} />
          </View>
        </View>
        
        <View className="flex-1 p-3 justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1.5">
              <MapPinIcon size={12} color="#10B981" />
              <Text className="text-xs text-gray-700 ml-1 flex-1" numberOfLines={1}>
                {ride.pickupLabel}
              </Text>
            </View>
            <View className="w-3 h-3 items-center justify-center my-0.5 ml-0.5">
              <View className="w-0.5 h-3 bg-gray-400" />
            </View>
            <View className="flex-row items-center mb-2">
              <MapPinIcon size={12} color="#F97316" />
              <Text className="text-xs text-gray-700 ml-1 flex-1" numberOfLines={1}>
                {ride.dropLabel}
              </Text>
            </View>
            {ride.title ? (
              <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
                {ride.title}
              </Text>
            ) : null}
          </View>

          <View>
            <View className="flex-row items-baseline justify-between mb-2">
              <Text className="text-xl font-bold text-blue-600">{format(ride.priceTotal)}</Text>
              <Text className="text-xs text-gray-500">{formatDepartTime(ride.departAt)}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              {ride.seatsTotal ? (
                <View className="flex-row items-center">
                  <UsersIcon size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">{ride.seatsTotal} seats</Text>
                </View>
              ) : ride.seatsNeeded ? (
                <View className="flex-row items-center">
                  <UsersIcon size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">{ride.seatsNeeded} needed</Text>
                </View>
              ) : null}
              {expiresIn !== null && ride.status === "OPEN" ? (
                <Text className="text-xs text-gray-500">Expires in {expiresIn}h</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
