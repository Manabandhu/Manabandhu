import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RoomListingForm, { RoomListingFormValues } from "@/features/travel/rooms/components/RoomListingForm";
import { roomsApi } from "@/shared/api/rooms";
import { uploadRoomImages } from "@/features/travel/rooms/storage";
import { auth } from "@/services/auth";
import { RoomListing } from "@/shared/types";
import { buildRoomListingPayload } from "@/features/travel/rooms/utils/listingPayload";
import { getRequestErrorMessage } from "@/shared/api/request-utils";

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

      const payload = buildRoomListingPayload(values, [...existingUrls, ...uploadedUrls]);

      await roomsApi.updateListing(id, payload);
      Alert.alert("Listing updated", "Your changes are saved.");
      router.replace(`/rooms/detail?id=${id}`);
    } catch (err) {
      Alert.alert("Unable to update listing", getRequestErrorMessage(err, "Please try again."));
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
