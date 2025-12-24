import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RidePostSummary } from "@/types";
import RideStatusBadge from "@/components/rides/RideStatusBadge";
import { formatDepartTime, hoursUntil } from "@/lib/rides/format";
import { MapPinIcon, UsersIcon } from "@/components/ui/Icons";

interface RideCardProps {
  ride: RidePostSummary;
  onPress?: () => void;
}

export default function RideCard({ ride, onPress }: RideCardProps) {
  const expiresIn = hoursUntil(ride.expiresAt);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center">
            <MapPinIcon size={16} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900 ml-2" numberOfLines={2}>
              {ride.pickupLabel} → {ride.dropLabel}
            </Text>
          </View>
          {ride.title ? (
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
              {ride.title}
            </Text>
          ) : null}
        </View>
        <Text className="text-blue-600 font-semibold">${ride.priceTotal.toFixed(2)}</Text>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-sm text-gray-600">{formatDepartTime(ride.departAt)}</Text>
        {ride.seatsTotal ? (
          <View className="flex-row items-center">
            <UsersIcon size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">{ride.seatsTotal} seats</Text>
          </View>
        ) : ride.seatsNeeded ? (
          <View className="flex-row items-center">
            <UsersIcon size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">{ride.seatsNeeded} needed</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <RideStatusBadge status={ride.status} />
        {expiresIn !== null && ride.status === "OPEN" ? (
          <Text className="text-xs text-gray-500">Expires in {expiresIn}h</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
