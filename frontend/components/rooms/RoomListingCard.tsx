import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MapPinIcon, HomeIcon } from "@/components/ui/Icons";
import { RoomListingSummary } from "@/types";

interface RoomListingCardProps {
  listing: RoomListingSummary;
  viewMode?: "list" | "grid";
  onPress: () => void;
}

export default function RoomListingCard({ listing, onPress, viewMode = "list" }: RoomListingCardProps) {
  const cover = listing.imageUrls?.[0];
  const statusStyle =
    listing.status === "AVAILABLE"
      ? { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" }
      : listing.status === "IN_TALKS"
      ? { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" }
      : { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  if (viewMode === "grid") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl border border-gray-200 shadow-md mb-3 overflow-hidden"
        style={{ width: "48%" }}
      >
        <View className="relative">
          {cover ? (
            <Image source={{ uri: cover }} className="h-40 w-full" resizeMode="cover" />
          ) : (
            <View className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <HomeIcon size={24} color="#9CA3AF" />
            </View>
          )}
          <View className={`absolute top-3 right-3 px-2 py-1 rounded-lg ${statusStyle.bg}`}>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`} />
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{listing.status}</Text>
            </View>
          </View>
        </View>
        <View className="p-3">
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
            {listing.title}
          </Text>
          <View className="flex-row items-center mb-2">
            <MapPinIcon size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-1 flex-1" numberOfLines={1}>
              {listing.approxAreaLabel}
            </Text>
          </View>
          <View className="flex-row items-baseline justify-between mt-2">
            <View>
              <Text className="text-lg font-bold text-indigo-600">₹{listing.rentMonthly}</Text>
              <Text className="text-xs text-gray-500">per month</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
              <Text className="text-xs font-medium text-indigo-700">{listing.roomType}</Text>
            </View>
            {listing.listingFor && (
              <View className="bg-purple-50 px-2 py-0.5 rounded-md">
                <Text className="text-xs font-medium text-purple-700">{listing.listingFor}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List View (Horizontal Card)
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-200 shadow-md mb-4 overflow-hidden"
    >
      <View className="flex-row">
        <View className="relative" style={{ width: 160 }}>
          {cover ? (
            <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <HomeIcon size={32} color="#9CA3AF" />
            </View>
          )}
          <View className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg ${statusStyle.bg}`}>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`} />
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{listing.status}</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={2}>
                {listing.title}
              </Text>
              <View className="flex-row items-center">
                <MapPinIcon size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1.5" numberOfLines={1}>
                  {listing.approxAreaLabel}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-baseline justify-between mb-3">
            <View>
              <Text className="text-2xl font-bold text-indigo-600">₹{listing.rentMonthly}</Text>
              <Text className="text-xs text-gray-500">per month</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-semibold text-indigo-700">{listing.roomType}</Text>
            </View>
            {listing.listingFor && (
              <View className="bg-purple-50 px-3 py-1.5 rounded-lg">
                <Text className="text-xs font-semibold text-purple-700">{listing.listingFor}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
