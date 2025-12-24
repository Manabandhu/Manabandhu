import React from "react";
import { Text } from "react-native";
import { RideStatus } from "@/types";
import { formatRideStatus } from "@/lib/rides/format";

export default function RideStatusBadge({ status }: { status: RideStatus }) {
  return (
    <Text className="text-xs uppercase text-gray-500">
      {formatRideStatus(status).toUpperCase()}
    </Text>
  );
}
