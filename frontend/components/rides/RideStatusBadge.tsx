import React from "react";
import { View, Text } from "react-native";
import { RideStatus } from "@/types";
import { formatRideStatus } from "@/lib/rides/format";

const STATUS_STYLES: Record<RideStatus, { bg: string; text: string }> = {
  OPEN: { bg: "bg-emerald-100", text: "text-emerald-700" },
  IN_TALKS: { bg: "bg-amber-100", text: "text-amber-700" },
  BOOKED: { bg: "bg-blue-100", text: "text-blue-700" },
  REBOOKED: { bg: "bg-purple-100", text: "text-purple-700" },
  CANCELLED: { bg: "bg-rose-100", text: "text-rose-700" },
  ARCHIVED: { bg: "bg-gray-200", text: "text-gray-600" },
};

export default function RideStatusBadge({ status }: { status: RideStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <View className={`px-2 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{formatRideStatus(status)}</Text>
    </View>
  );
}
