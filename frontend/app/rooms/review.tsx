import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { roomsApi } from "@/lib/api/rooms";
import { ReviewType } from "@/types";

const REVIEW_TYPES: ReviewType[] = ["HOUSE", "USER"];

export default function ReviewFlow() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [type, setType] = useState<ReviewType>("HOUSE");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState("");
  const [comment, setComment] = useState("");
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEligibility = async () => {
    if (!listingId) return;
    try {
      const response = await roomsApi.getReviewEligibility(listingId);
      setEligible(response.eligible);
    } catch (err) {
      setEligible(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
  }, [listingId]);

  const submitReview = async () => {
    if (!listingId) return;
    if (!eligible) {
      Alert.alert("Not eligible", "You can only review after chatting with the owner.");
      return;
    }
    try {
      await roomsApi.createReview(listingId, {
        type,
        rating,
        tags: tags
          ? tags.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        comment,
      });
      Alert.alert("Review submitted", "Thanks for sharing your feedback.");
      router.back();
    } catch (err) {
      Alert.alert("Unable to submit review", "Please try again.");
    }
  };

  if (!listingId) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Listing not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</Text>
      <Text className="text-gray-500 mb-4">Share your experience with this listing.</Text>

      {loading ? (
        <Text className="text-gray-500">Checking eligibility...</Text>
      ) : !eligible ? (
        <View className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <Text className="text-yellow-700">You can review after a conversation starts.</Text>
        </View>
      ) : (
        <View className="gap-4">
          <View>
            <Text className="text-sm text-gray-600 mb-2">Review Type</Text>
            <View className="flex-row gap-2">
              {REVIEW_TYPES.map((reviewType) => (
                <TouchableOpacity
                  key={reviewType}
                  onPress={() => setType(reviewType)}
                  className={`px-3 py-2 rounded-full border ${
                    type === reviewType ? "bg-blue-600 border-blue-600" : "border-gray-200"
                  }`}
                >
                  <Text className={`${type === reviewType ? "text-white" : "text-gray-700"}`}>{reviewType}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm text-gray-600 mb-2">Rating</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  className={`h-10 w-10 rounded-full items-center justify-center border ${
                    rating === value ? "bg-blue-600 border-blue-600" : "border-gray-200"
                  }`}
                >
                  <Text className={`${rating === value ? "text-white" : "text-gray-700"}`}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm text-gray-600 mb-1">Tags</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="clean, responsive"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </View>

          <View>
            <Text className="text-sm text-gray-600 mb-1">Comments</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience"
              multiline
              numberOfLines={4}
              className="border border-gray-200 rounded-lg px-3 py-2 h-24"
            />
          </View>

          <TouchableOpacity onPress={submitReview} className="bg-blue-600 rounded-lg py-3">
            <Text className="text-white text-center font-semibold">Submit review</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
