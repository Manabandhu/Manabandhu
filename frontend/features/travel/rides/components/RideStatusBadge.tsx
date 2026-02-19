import React from "react";
import { View, Text } from "react-native";
import { RideStatus } from '@/shared/types";
import { formatRideStatus } from '@/features/travel/rides/api/format";

export default function RideStatusBadge({ status }: { status: RideStatus }) {
  const statusStyle =
    status === "OPEN"
      ? { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" }
      : status === "IN_TALKS"
      ? { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" }
      : status === "BOOKED"
      ? { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" }
      : status === "REBOOKED"
      ? { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" }
      : status === "CANCELLED"
      ? { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" }
      : { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <View className={`px-2 py-0.5 rounded-md ${statusStyle.bg}`}>
      <View className="flex-row items-center">
        <View className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1`} />
        <Text className={`text-xs font-semibold ${statusStyle.text}`}>
          {formatRideStatus(status)}
        </Text>
      </View>
    </View>
  );
}
