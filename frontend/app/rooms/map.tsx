import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPinIcon } from '@/components/ui/Icons';

export default function RoomsMap() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Room Map</Text>
        <View className="w-12" />
      </View>

      <View className="flex-1 justify-center items-center py-20">
        <MapPinIcon size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg mt-4">Map View</Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Interactive map showing room locations will be available soon
        </Text>
      </View>
    </ScrollView>
  );
}