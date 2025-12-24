import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import RoomListingForm, { RoomListingFormValues } from "@/components/rooms/RoomListingForm";
import { roomsApi } from "@/lib/api/rooms";
import { uploadRoomImages } from "@/lib/rooms/storage";
import { auth } from "@/lib/firebase";

export default function CreateRoomListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const parseContactPreference = (value: string) => {
    if (!value.trim()) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (values: RoomListingFormValues) => {
    if (!values.title.trim() || !values.rentMonthly.trim() || !values.latApprox.trim() || !values.lngApprox.trim()) {
      Alert.alert("Missing required fields", "Please complete all required fields.");
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
      Alert.alert("Listing created", "Your listing is now live.");
      router.replace("/rooms");
    } catch (err) {
      Alert.alert("Unable to create listing", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Create Listing</Text>
      <RoomListingForm submitLabel="Publish listing" loading={loading} onSubmit={handleSubmit} />
    </View>
  );
}
