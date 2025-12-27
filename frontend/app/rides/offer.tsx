import React from "react";
import { ScrollView, Text, View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RidePostForm from "@/components/rides/RidePostForm";
import { ridesApi } from "@/lib/api/rides";
import { RidePost } from "@/types";
import { ArrowLeftIcon, CarIcon } from "@/components/ui/Icons";

export default function CreateRideOffer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubmit = async (payload: Partial<RidePost>) => {
    const response = await ridesApi.createPost({ ...payload, postType: "OFFER" });
    router.replace(`/rides/detail?id=${response.post.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
            activeOpacity={0.7}
          >
            <ArrowLeftIcon size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <CarIcon size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Offer a Ride</Text>
              <Text className="text-xs text-gray-500 mt-0.5">Share your ride with others</Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 py-6">
            <RidePostForm type="OFFER" onSubmit={handleSubmit} submitLabel="Publish Offer" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
