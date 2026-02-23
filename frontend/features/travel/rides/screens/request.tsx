import React from "react";
import { ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import RidePostForm from "@/features/travel/rides/components/RidePostForm";
import { ridesApi } from "@/features/travel/rides/api";
import { RidePost } from "@/shared/types";
import { ArrowLeftIcon, MapPinIcon } from "@/shared/components/ui/Icons";

export default function CreateRideRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubmit = async (payload: Partial<RidePost>) => {
    const response = await ridesApi.createPost({ ...payload, postType: "REQUEST" });
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
            <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
              <MapPinIcon size={20} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Request a Ride</Text>
              <Text className="text-xs text-gray-500 mt-0.5">Find someone to share a ride with</Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 py-6">
            <RidePostForm type="REQUEST" onSubmit={handleSubmit} submitLabel="Publish Request" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
