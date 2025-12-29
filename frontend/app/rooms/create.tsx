import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, Animated, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import RoomListingForm, { RoomListingFormValues } from "@/components/rooms/RoomListingForm";
import { roomsApi } from "@/lib/api/rooms";
import { uploadRoomImages } from "@/lib/rooms/storage";
import { auth } from "@/lib/firebase";
import { CheckIcon, HomeIcon } from "@/components/ui/Icons";

export default function CreateRoomListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const parseContactPreference = (value: string) => {
    if (!value.trim()) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (values: RoomListingFormValues) => {
    // Comprehensive validation
    const errors: string[] = [];
    
    if (!values.title.trim()) {
      errors.push("Title is required");
    }
    if (!values.rentMonthly.trim() || isNaN(Number(values.rentMonthly)) || Number(values.rentMonthly) <= 0) {
      errors.push("Valid rent amount is required");
    }
    if (!values.latApprox.trim() || isNaN(Number(values.latApprox))) {
      errors.push("Approximate location (latitude) is required");
    }
    if (!values.lngApprox.trim() || isNaN(Number(values.lngApprox))) {
      errors.push("Approximate location (longitude) is required");
    }
    if (!values.approxAreaLabel.trim()) {
      errors.push("Area label is required");
    }
    if (!values.listingFor) {
      errors.push("Listing type is required");
    }
    if (!values.roomType) {
      errors.push("Room type is required");
    }
    if (!values.visitType) {
      errors.push("Visit type is required");
    }
    if (values.locationExactEnabled) {
      if (!values.latExact.trim() || isNaN(Number(values.latExact))) {
        errors.push("Exact location (latitude) is required when exact location is enabled");
      }
      if (!values.lngExact.trim() || isNaN(Number(values.lngExact))) {
        errors.push("Exact location (longitude) is required when exact location is enabled");
      }
    }

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

      const payload = {
        title: values.title.trim(),
        listingFor: values.listingFor,
        roomType: values.roomType,
        peopleAllowed: Number(values.peopleAllowed) || 1,
        rentMonthly: Number(values.rentMonthly),
        deposit: values.deposit ? Number(values.deposit) : null,
        leaseStartDate: values.leaseStartDate || null,
        leaseEndDate: values.leaseEndDate || null,
        leaseExtendable: values.leaseExtendable,
        utilitiesIncluded: values.utilitiesIncluded,
        utilities: values.utilities
          ? values.utilities.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        amenities: values.amenities
          ? values.amenities.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        visitType: values.visitType,
        contactPreference: parseContactPreference(values.contactPreference),
        description: values.description,
        locationExactEnabled: values.locationExactEnabled,
        latExact: values.locationExactEnabled && values.latExact ? Number(values.latExact) : null,
        lngExact: values.locationExactEnabled && values.lngExact ? Number(values.lngExact) : null,
        latApprox: Number(values.latApprox),
        lngApprox: Number(values.lngApprox),
        approxAreaLabel: values.approxAreaLabel,
        nearbyLocalities: values.nearbyLocalities
          ? values.nearbyLocalities.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        nearbySchools: values.nearbySchools
          ? values.nearbySchools.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        nearbyCompanies: values.nearbyCompanies
          ? values.nearbyCompanies.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        imageUrls: [...existingUrls, ...uploadedUrls],
      };

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
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred. Please try again.";
      
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
