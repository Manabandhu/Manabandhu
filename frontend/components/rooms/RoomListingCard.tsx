import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MapPinIcon, HomeIcon } from "@/components/ui/Icons";
import { RoomListingSummary } from "@/types";

interface RoomListingCardProps {
  listing: RoomListingSummary;
  onPress: () => void;
}

export default function RoomListingCard({ listing, onPress }: RoomListingCardProps) {
  const cover = listing.imageUrls?.[0];
  const statusStyle =
    listing.status === "AVAILABLE"
      ? { bg: "bg-green-100", text: "text-green-700" }
      : listing.status === "IN_TALKS"
      ? { bg: "bg-yellow-100", text: "text-yellow-700" }
      : { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden"
    >
      {cover ? (
        <Image source={{ uri: cover }} className="h-44 w-full" resizeMode="cover" />
      ) : (
        <View className="h-44 w-full bg-gray-100 items-center justify-center">
          <HomeIcon size={28} color="#9CA3AF" />
          <Text className="text-gray-400 mt-2">No image</Text>
        </View>
      )}
      <View className="p-4 gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{listing.title}</Text>
            <View className="flex-row items-center mt-2">
              <MapPinIcon size={16} color="#9CA3AF" />
              <Text className="text-gray-500 ml-1">{listing.approxAreaLabel}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-blue-600 font-semibold">₹{listing.rentMonthly}</Text>
            <Text className="text-xs text-gray-500">per month</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-blue-700">{listing.roomType}</Text>
          </View>
          <View className="bg-purple-50 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-purple-700">{listing.listingFor}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs font-medium ${statusStyle.text}`}>{listing.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
