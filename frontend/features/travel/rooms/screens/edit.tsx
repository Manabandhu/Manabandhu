import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RoomListingForm, { RoomListingFormValues } from "@/features/travel/rooms/components/RoomListingForm";
import { roomsApi } from "@/shared/api/rooms";
import { uploadRoomImages } from "@/features/travel/rooms/storage";
import { auth } from "@/services/auth";
import { RoomListing } from "@/shared/types";

export default function EditRoomListing() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<RoomListing | null>(null);
  const [loading, setLoading] = useState(false);

  const loadListing = async () => {
    if (!id) return;
    try {
      const data = await roomsApi.getListing(id);
      setListing(data);
    } catch (err) {
      Alert.alert("Unable to load listing", "Please try again.");
    }
  };

  useEffect(() => {
    loadListing();
  }, [id]);

  const parseContactPreference = (value: string) => {
    if (!value.trim()) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (values: RoomListingFormValues) => {
    if (!id) return;
    setLoading(true);
    try {
      const ownerUserId = auth.currentUser?.uid;
      if (!ownerUserId) {
        Alert.alert("Login required", "Please sign in to edit a listing.");
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

      await roomsApi.updateListing(id, payload);
      Alert.alert("Listing updated", "Your changes are saved.");
      router.replace(`/rooms/detail?id=${id}`);
    } catch (err) {
      Alert.alert("Unable to update listing", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading listing...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Edit Listing</Text>
      <RoomListingForm
        initialValues={listing}
        submitLabel="Save changes"
        loading={loading}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
