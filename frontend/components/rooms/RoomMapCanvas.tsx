import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RoomListingSummary } from "@/types";

interface RoomMapCanvasProps {
  listings: RoomListingSummary[];
  onSelect: (listing: RoomListingSummary) => void;
}

const hashToOffset = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 1000;
  }
  const offset = (hash % 20) / 10000;
  return offset;
};

const getDisplayCoordinates = (listing: RoomListingSummary) => {
  if (listing.locationExactEnabled && listing.latExact && listing.lngExact) {
    return { lat: listing.latExact, lng: listing.lngExact };
  }
  const offset = hashToOffset(listing.id);
  return {
    lat: listing.latApprox + offset,
    lng: listing.lngApprox - offset,
  };
};

export default function RoomMapCanvas({ listings, onSelect }: RoomMapCanvasProps) {
  const coordinates = useMemo(() => listings.map((listing) => ({
    listing,
    ...getDisplayCoordinates(listing),
  })), [listings]);

  const bounds = useMemo(() => {
    if (!coordinates.length) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }
    const lats = coordinates.map((item) => item.lat);
    const lngs = coordinates.map((item) => item.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [coordinates]);

  const normalize = (value: number, min: number, max: number) => {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  };

  return (
    <View className="flex-1 bg-blue-50 rounded-3xl overflow-hidden border border-blue-100">
      <View className="absolute inset-0 opacity-20">
        <View className="flex-1 border-t border-blue-100" />
        <View className="flex-1 border-t border-blue-100" />
        <View className="flex-1 border-t border-blue-100" />
      </View>
      {coordinates.map(({ listing, lat, lng }) => {
        const x = normalize(lng, bounds.minLng, bounds.maxLng);
        const y = normalize(lat, bounds.minLat, bounds.maxLat);
        return (
          <TouchableOpacity
            key={listing.id}
            onPress={() => onSelect(listing)}
            className="absolute items-center"
            style={{
              left: `${Math.min(Math.max(x, 0.05), 0.95) * 100}%`,
              top: `${(1 - Math.min(Math.max(y, 0.05), 0.95)) * 100}%`,
              transform: [{ translateX: -20 }, { translateY: -30 }],
            }}
          >
            <View className="bg-white border border-blue-200 rounded-full px-3 py-1 shadow-sm">
              <Text className="text-xs font-semibold text-blue-700">₹{listing.rentMonthly}</Text>
            </View>
            <View className="w-2 h-2 bg-blue-600 rounded-full mt-1" />
          </TouchableOpacity>
        );
      })}
      {!listings.length && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No listings in this area</Text>
        </View>
      )}
    </View>
  );
}
