import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import RoomListingForm, { RoomListingFormValues } from "@/features/travel/rooms/components/RoomListingForm";
import { roomsApi } from "@/shared/api/rooms";
import { uploadRoomImages } from "@/features/travel/rooms/storage";
import { auth } from "@/services/auth";
import {
  buildRoomListingPayload,
  validateRoomListingValues,
} from "@/features/travel/rooms/utils/listingPayload";
import { getRequestErrorMessage } from "@/shared/api/request-utils";

interface CreateRoomBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  onSuccess?: () => void;
}

export default function CreateRoomBottomSheet({ sheetRef, onSuccess }: CreateRoomBottomSheetProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RoomListingFormValues) => {
    const validationErrors = validateRoomListingValues(values);
    if (validationErrors.length > 0) {
      Alert.alert("Missing required fields", validationErrors.join("\n"));
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
      Alert.alert("Listing created", "Your listing is now live.");
      sheetRef.current?.close();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      Alert.alert("Unable to create listing", getRequestErrorMessage(err, "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="items-center mb-4 pt-2">
        <View className="w-12 h-1 bg-gray-300 rounded-full" />
        <Text className="text-xl font-bold text-gray-900 mt-4">Create Listing</Text>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-4">
          <RoomListingForm submitLabel="Publish listing" loading={loading} onSubmit={handleSubmit} />
        </View>
      </ScrollView>
    </View>
  );
}

