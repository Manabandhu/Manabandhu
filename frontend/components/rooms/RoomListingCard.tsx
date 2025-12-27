import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { MapPinIcon, HomeIcon } from "@/components/ui/Icons";
import { RoomListingSummary } from "@/types";
import { formatRoomStatus, formatRoomType, formatListingFor } from "@/lib/rooms/format";

interface RoomListingCardProps {
  listing: RoomListingSummary;
  viewMode?: "list" | "grid";
  onPress: () => void;
}

export default function RoomListingCard({ listing, onPress, viewMode = "list" }: RoomListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const images = listing.imageUrls || [];
  const hasMultipleImages = images.length > 1;
  
  const statusStyle =
    listing.status === "AVAILABLE"
      ? { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" }
      : listing.status === "IN_TALKS"
      ? { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" }
      : { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const handleCardLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && cardWidth !== width) {
      setCardWidth(width);
    }
  };

  if (viewMode === "grid") {
    const imageWidth = cardWidth || Dimensions.get("window").width * 0.48;
    
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl border border-gray-200 shadow-md mb-3 overflow-hidden"
        style={{ width: "48%" }}
        onLayout={handleCardLayout}
      >
        <View className="relative">
          {images.length > 0 ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ height: 160 }}
            >
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{ width: imageWidth, height: 160 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <HomeIcon size={24} color="#9CA3AF" />
            </View>
          )}
          <View className={`absolute top-3 right-3 px-2 py-1 rounded-lg ${statusStyle.bg}`}>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-1.5`} />
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{formatRoomStatus(listing.status)}</Text>
            </View>
          </View>
          {hasMultipleImages && (
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1.5">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index === currentImageIndex ? "bg-white w-4" : "bg-white/50 w-1.5"
                  }`}
                />
              ))}
            </View>
          )}
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
              <Text className="text-xs font-medium text-indigo-700">{formatRoomType(listing.roomType)}</Text>
            </View>
            {listing.listingFor && (
              <View className="bg-purple-50 px-2 py-0.5 rounded-md">
                <Text className="text-xs font-medium text-purple-700">{formatListingFor(listing.listingFor)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List View (Horizontal Card)
  const listImageWidth = 140;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-200 shadow-sm mb-3 overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="flex-row" style={{ minHeight: 140 }}>
        <View className="relative" style={{ width: 140, height: 140 }}>
          {images.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={{ width: 140, height: 140 }}
              >
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: 140, height: 140 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {hasMultipleImages && (
                <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-1">
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`h-1 rounded-full ${
                        index === currentImageIndex ? "bg-white w-2" : "bg-white/50 w-1"
                      }`}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center">
              <HomeIcon size={32} color="#9CA3AF" />
            </View>
          )}
          <View className={`absolute top-2 left-2 px-2 py-0.5 rounded-md ${statusStyle.bg}`}>
            <View className="flex-row items-center">
              <View className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1`} />
              <Text className={`text-xs font-semibold ${statusStyle.text}`}>{formatRoomStatus(listing.status)}</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-1 p-3 justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900 mb-1.5" numberOfLines={2}>
              {listing.title}
            </Text>
            <View className="flex-row items-center mb-2">
              <MapPinIcon size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1 flex-1" numberOfLines={1}>
                {listing.approxAreaLabel}
              </Text>
            </View>
          </View>

          <View>
            <View className="flex-row items-baseline mb-2">
              <Text className="text-xl font-bold text-indigo-600">₹{listing.rentMonthly}</Text>
              <Text className="text-xs text-gray-500 ml-1">per month</Text>
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              <View className="bg-indigo-50 px-2 py-1 rounded-md">
                <Text className="text-xs font-medium text-indigo-700">{formatRoomType(listing.roomType)}</Text>
              </View>
              {listing.listingFor && (
                <View className="bg-purple-50 px-2 py-1 rounded-md">
                  <Text className="text-xs font-medium text-purple-700">{formatListingFor(listing.listingFor)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

