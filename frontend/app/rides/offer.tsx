import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import RidePostForm from "@/components/rides/RidePostForm";
import { ridesApi } from "@/lib/api/rides";
import { RidePost } from "@/types";

export default function CreateRideOffer() {
  const router = useRouter();

  const handleSubmit = async (payload: Partial<RidePost>) => {
    const response = await ridesApi.createPost({ ...payload, postType: "OFFER" });
    router.replace(`/rides/detail?id=${response.post.id}`);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-5 py-5">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Offer a Ride</Text>
        <RidePostForm type="OFFER" onSubmit={handleSubmit} submitLabel="Publish Offer" />
      </View>
    </ScrollView>
  );
}
