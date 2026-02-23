import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, Animated, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import RoomListingForm, { RoomListingFormValues } from "@/features/travel/rooms/components/RoomListingForm";
import { roomsApi } from "@/shared/api/rooms";
import { uploadRoomImages } from "@/features/travel/rooms/storage";
import { auth } from "@/services/auth";
import { CheckIcon, HomeIcon } from "@/shared/components/ui/Icons";
import {
  buildRoomListingPayload,
  validateRoomListingValues,
} from "@/features/travel/rooms/utils/listingPayload";
import { getRequestErrorMessage } from "@/shared/api/request-utils";

export default function CreateRoomListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async (values: RoomListingFormValues) => {
    const errors = validateRoomListingValues(values);

    if (errors.length > 0) {
      Alert.alert(
        "Validation Error",
        errors.join("\n"),
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const ownerUserId = auth.currentUser?.uid;
      if (!ownerUserId) {
        Alert.alert("Login required", "Please sign in to create a listing.");
        setLoading(false);
        return;
      }

      const newImageUris = values.images.filter((image) => !image.isRemote).map((image) => image.uri);
      const uploadedUrls = newImageUris.length ? await uploadRoomImages(newImageUris, ownerUserId) : [];
      const existingUrls = values.images.filter((image) => image.isRemote).map((image) => image.uri);

      const payload = buildRoomListingPayload(values, [...existingUrls, ...uploadedUrls]);

      await roomsApi.createListing(payload);
      setShowSuccess(true);
      
      // Animate success screen
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate checkmark
      setTimeout(() => {
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }, 200);

      // Navigate after animation
      setTimeout(() => {
        router.replace("/rooms");
      }, 2500);
    } catch (err) {
      console.error("Error creating listing:", err);
      const errorMessage = getRequestErrorMessage(err);
      
      Alert.alert(
        "Failed to Create Listing",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <View className="flex-1 bg-indigo-50 items-center justify-center px-6">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="items-center"
        >
          <View className="bg-white rounded-full p-8 mb-6 shadow-lg">
            <Animated.View
              style={{
                transform: [{ scale: checkScaleAnim }],
              }}
            >
              <View className="bg-green-500 rounded-full p-4">
                <CheckIcon size={48} color="#FFFFFF" />
              </View>
            </Animated.View>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Listing Published!</Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Your room listing is now live and visible to potential tenants.
          </Text>
          <View className="bg-white rounded-2xl p-6 shadow-md w-full">
            <View className="flex-row items-center mb-4">
              <HomeIcon size={32} color="#4F46E5" />
              <View className="ml-4 flex-1">
                <Text className="text-sm text-gray-500">What's next?</Text>
                <Text className="text-base font-semibold text-gray-900 mt-1">
                  Start receiving inquiries
                </Text>
              </View>
            </View>
            <View className="h-px bg-gray-200 my-4" />
            <Text className="text-sm text-gray-600">
              • Respond to messages promptly{"\n"}
              • Update availability status{"\n"}
              • Share your listing with friends
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View className="flex-1 px-6 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Create Listing</Text>
        <RoomListingForm submitLabel="Publish listing" loading={loading} onSubmit={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
