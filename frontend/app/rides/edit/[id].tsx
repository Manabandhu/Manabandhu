import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RidePostForm from "@/components/rides/RidePostForm";
import { ridesApi } from "@/lib/api/rides";
import { RidePost } from "@/types";

export default function EditRidePost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<RidePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRide = async () => {
      if (!id) return;
      try {
        const response = await ridesApi.getPost(id);
        setRide(response);
      } catch {
        setError("Unable to load ride.");
      } finally {
        setLoading(false);
      }
    };
    loadRide();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading ride...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Ride not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Edit Ride</Text>
      {error ? (
        <View className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}
      <RidePostForm
        type={ride.postType}
        initial={ride}
        submitLabel="Save Changes"
        onSubmit={async (payload) => {
          if (!id) return;
          const updated = await ridesApi.updatePost(id, payload);
          router.replace(`/rides/detail?id=${updated.id}`);
        }}
      />
    </ScrollView>
  );
}
