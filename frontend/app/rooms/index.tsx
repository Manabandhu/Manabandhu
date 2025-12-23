import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from '@/constants/api';
import { auth } from '@/lib/firebase';
import { HomeIcon, MapPinIcon, DollarSignIcon } from "@/components/ui/Icons";

interface Room {
  id: number;
  title: string;
  description: string;
  location: string;
  rent: number;
  type: string;
  contactInfo: string;
  createdAt: string;
}

export default function RoomFinder() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRooms = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRooms(data.content || []);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading rooms...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">Rooms</Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => router.push("/rooms/post")}
        >
          <Text className="text-white font-semibold">+ Post</Text>
        </TouchableOpacity>
      </View>

      {rooms.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <HomeIcon size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No rooms available</Text>
          <Text className="text-gray-400 text-sm mt-2">Be the first to post a listing!</Text>
        </View>
      ) : (
        rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => router.push(`/rooms/detail?id=${room.id}`)}
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {room.title}
            </Text>
            <View className="flex-row items-center mb-2">
              <MapPinIcon size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">{room.location}</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <DollarSignIcon size={16} color="#10B981" />
              <Text className="text-green-600 font-semibold ml-1">
                ${room.rent}/month
              </Text>
              <Text className="text-gray-400 mx-2">•</Text>
              <Text className="text-gray-600">{room.type.replace('_', ' ')}</Text>
            </View>
            <Text className="text-gray-700" numberOfLines={2}>
              {room.description}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}


