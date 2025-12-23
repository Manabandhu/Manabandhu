import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from '@/constants/api';
import { auth } from '@/lib/firebase';
import { CarIcon, MapPinIcon, UsersIcon } from "@/components/ui/Icons";

interface Ride {
  id: number;
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  contactInfo: string;
  createdAt: string;
}

export default function RideShare() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRides = async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRides(data.content || []);
    } catch (error) {
      console.error('Failed to load rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRides();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading rides...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 px-4 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">Rides</Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => router.push("/rides/offer")}
        >
          <Text className="text-white font-semibold">+ Offer</Text>
        </TouchableOpacity>
      </View>

      {rides.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <CarIcon size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No rides available</Text>
          <Text className="text-gray-400 text-sm mt-2">Be the first to offer a ride!</Text>
        </View>
      ) : (
        rides.map((ride) => (
          <TouchableOpacity
            key={ride.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => router.push(`/rides/detail?id=${ride.id}`)}
          >
            <View className="flex-row items-center mb-3">
              <MapPinIcon size={18} color="#10B981" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                {ride.fromLocation} → {ride.toLocation}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">
                {formatTime(ride.departureTime)}
              </Text>
              <View className="flex-row items-center">
                <UsersIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-1">
                  {ride.availableSeats} seats
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-green-600 font-semibold">
                ${ride.pricePerSeat}/seat
              </Text>
              <Text className="text-blue-600 font-medium">Book Now</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}


