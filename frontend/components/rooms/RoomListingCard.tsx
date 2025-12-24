import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { RoomListingSummary } from "@/types";

interface RoomListingCardProps {
  listing: RoomListingSummary;
  onPress: () => void;
}

export default function RoomListingCard({ listing, onPress }: RoomListingCardProps) {
  const cover = listing.imageUrls?.[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden"
    >
      {cover ? (
        <Image source={{ uri: cover }} className="h-40 w-full" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full bg-gray-100 items-center justify-center">
          <Text className="text-gray-400">No image</Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900">{listing.title}</Text>
          <Text className="text-blue-600 font-semibold">₹{listing.rentMonthly}</Text>
        </View>
        <Text className="text-gray-500 mt-1">{listing.approxAreaLabel}</Text>
        <View className="flex-row items-center gap-2 mt-2">
          <Text className="text-xs uppercase text-gray-500">{listing.roomType}</Text>
          <Text className="text-xs uppercase text-gray-500">{listing.listingFor}</Text>
          <Text className="text-xs uppercase text-gray-500">{listing.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
