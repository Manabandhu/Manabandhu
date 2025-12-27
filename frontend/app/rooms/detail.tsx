import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { openMapsDirections } from "@/lib/maps";
import { roomsApi } from "@/lib/api/rooms";
import { ListingStatus, RoomListing, RoomReview } from "@/types";
import { MapPinIcon, HomeIcon } from "@/components/ui/Icons";
import { formatRoomStatus, formatRoomType, formatListingFor } from "@/lib/rooms/format";
import { useCurrency } from "@/lib/currency";

const STATUS_OPTIONS: ListingStatus[] = ["AVAILABLE", "IN_TALKS", "BOOKED", "HIDDEN", "ARCHIVED"];

export default function RoomDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<RoomListing | null>(null);
  const [reviews, setReviews] = useState<RoomReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const { format } = useCurrency();

  const loadListing = async () => {
    if (!id) return;
    setError(null);
    try {
      const [listingResponse, reviewsResponse] = await Promise.all([
        roomsApi.getListing(id),
        roomsApi.getReviews(id),
      ]);
      setListing(listingResponse);
      setReviews(reviewsResponse || []);
    } catch (err) {
      setError("Unable to load listing details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListing();
  }, [id]);

  const startChat = async () => {
    if (!id) return;
    try {
      const response = await roomsApi.startChat(id);
      router.push(`/chat/conversation?chatId=${response.chatThreadId}&name=${encodeURIComponent(listing?.title || "Room")}&listingId=${id}`);
    } catch (err) {
      Alert.alert("Unable to start chat", "Please try again in a moment.");
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert("Delete listing", "This will remove your listing from discovery.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await roomsApi.deleteListing(id);
            router.back();
          } catch (err) {
            Alert.alert("Unable to delete", "Please try again.");
          }
        },
      },
    ]);
  };

  const updateStatus = async (status: ListingStatus) => {
    if (!id) return;
    try {
      const updated = await roomsApi.updateStatus(id, status);
      setListing(updated);
    } catch (err) {
      Alert.alert("Unable to update status", "Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading listing...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Listing not found.</Text>
        {error && <Text className="text-red-500 mt-2">{error}</Text>}
      </View>
    );
  }

  const locationLabel = listing.approxAreaLabel;
  const screenWidth = Dimensions.get("window").width;
  const images = listing.imageUrls || [];
  
  // Filter out failed images - keep both URI and original index
  const validImagesWithIndex = images
    .map((uri, index) => ({ uri, originalIndex: index }))
    .filter(({ originalIndex }) => !failedImages.has(originalIndex));
  const validImages = validImagesWithIndex.map(item => item.uri);
  const hasMultipleImages = validImages.length > 1;

  const handleImageError = (originalIndex: number) => {
    setFailedImages(prev => new Set(prev).add(originalIndex));
  };

  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="relative">
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false} 
          onScroll={handleImageScroll}
          scrollEventThrottle={16}
          style={{ height: 240 }}
        >
          {validImages.length > 0 ? (
            validImagesWithIndex.map(({ uri, originalIndex }, displayIndex) => (
              <Image 
                key={`${uri}-${originalIndex}`} 
                source={{ uri }} 
                style={{ width: screenWidth, height: 240 }}
                resizeMode="cover"
                onError={() => handleImageError(originalIndex)}
              />
            ))
          ) : (
            <View style={{ width: screenWidth, height: 240 }} className="bg-gray-100 items-center justify-center">
              <HomeIcon size={32} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">No images available</Text>
            </View>
          )}
        </ScrollView>
        {hasMultipleImages && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {validImages.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      <View className="px-6 py-5 gap-4">
        <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">{listing.title}</Text>
          <Text className="text-blue-600 text-lg mt-1">{format(listing.rentMonthly)}/month</Text>
          <View className="flex-row items-center mt-3">
            <MapPinIcon size={16} color="#9CA3AF" />
            <Text className="text-gray-500 ml-1">{locationLabel}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-3">
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-blue-700">{formatRoomType(listing.roomType)}</Text>
            </View>
            <View className="bg-purple-50 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-purple-700">{formatListingFor(listing.listingFor)}</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-gray-700">{formatRoomStatus(listing.status)}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <Text className="text-gray-900 font-semibold mb-2">About this room</Text>
          <Text className="text-gray-700">{listing.description || "No description provided."}</Text>
        </View>

        <View className="flex-row gap-3">
          {!listing.owner && !["HIDDEN", "ARCHIVED", "DELETED"].includes(listing.status) && (
            <TouchableOpacity onPress={startChat} className="flex-1 bg-blue-600 rounded-xl py-3">
              <Text className="text-white text-center font-semibold">Start chat</Text>
            </TouchableOpacity>
          )}
          {listing.canReview && (
            <TouchableOpacity
              onPress={() => router.push(`/rooms/review?listingId=${listing.id}`)}
              className="flex-1 border border-blue-600 rounded-xl py-3"
            >
              <Text className="text-blue-600 text-center font-semibold">Leave a review</Text>
            </TouchableOpacity>
          )}
        </View>

        {listing.owner && (
          <View className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3">Manage listing</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => updateStatus(status)}
                  className={`px-3 py-2 rounded-full border ${
                    listing.status === status ? "bg-blue-600 border-blue-600" : "border-gray-200"
                  }`}
                >
                  <Text className={`${listing.status === status ? "text-white" : "text-gray-700"}`}>{formatRoomStatus(status)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => router.push(`/rooms/edit?id=${listing.id}`)}
                className="flex-1 border border-gray-200 rounded-lg py-2"
              >
                <Text className="text-center text-gray-700">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 bg-red-500 rounded-lg py-2"
              >
                <Text className="text-center text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm gap-3">
          <Text className="text-gray-900 font-semibold">Location</Text>
          <Text className="text-gray-600">{locationLabel}</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-lg py-2"
              onPress={() => router.push("/rooms?tab=map")}
            >
              <Text className="text-gray-900 text-center font-semibold">View on map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-lg py-2"
              onPress={() => openMapsDirections(locationLabel)}
            >
              <Text className="text-white text-center font-semibold">Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-3">Reviews</Text>
          {reviews.length === 0 ? (
            <Text className="text-gray-500">No reviews yet.</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} className="mb-3 pb-3 border-b border-gray-100">
                <Text className="text-gray-900 font-medium">{review.type} review</Text>
                <Text className="text-gray-600">Rating: {review.rating}/5</Text>
                {review.comment ? <Text className="text-gray-500 mt-1">{review.comment}</Text> : null}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
