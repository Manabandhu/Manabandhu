import React, { useMemo, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { RidePostSummary } from "@/shared/types";
import { MapPinIcon, CarIcon } from "@/shared/components/ui/Icons";
import { formatDepartTime, hoursUntil } from "@/features/travel/rides/api/format";
import { useCurrency } from "@/lib/currency";
import RideStatusBadge from "./RideStatusBadge";
// Platform-specific imports - Metro will resolve .native.ts or .web.ts automatically
// @ts-ignore - Platform-specific file resolution
import { MapView, Marker, PROVIDER_GOOGLE } from "../rooms/MapComponents";

interface RideMapCanvasProps {
  rides: RidePostSummary[];
  onSelect: (ride: RidePostSummary) => void;
}

export default function RideMapCanvas({ rides, onSelect }: RideMapCanvasProps) {
  const [selectedRide, setSelectedRide] = useState<RidePostSummary | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
  const { format } = useCurrency();

  const coordinates = useMemo(() => {
    // Use pickup location as the marker position
    return rides.map((ride) => ({
      ride,
      lat: ride.pickupLat,
      lng: ride.pickupLng,
    }));
  }, [rides]);

  const initialRegion = useMemo<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(() => {
    if (!coordinates.length) {
      return null;
    }
    const lats = coordinates.map((item) => item.lat);
    const lngs = coordinates.map((item) => item.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.05);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.05);
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [coordinates]);

  const handleMarkerPress = useCallback((ride: RidePostSummary) => {
    setSelectedRide(ride);
    bottomSheetRef.current?.expand();
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedRide) {
      onSelect(selectedRide);
    }
  }, [selectedRide, onSelect]);

  if (!initialRegion) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 rounded-3xl">
        <CarIcon size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-base mt-4">No rides in this area</Text>
      </View>
    );
  }

  // Web fallback - use Google Maps embed
  if (Platform.OS === 'web') {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || (typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY__);
    const center = `${initialRegion.latitude},${initialRegion.longitude}`;
    
    if (apiKey) {
      const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=11`;
      
      return (
        <View className="flex-1 relative">
          <View className="flex-1 bg-gray-100 rounded-3xl overflow-hidden">
            <iframe
              src={mapUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </View>
          {/* Markers overlay for web */}
          <View className="absolute inset-0 pointer-events-none">
            {coordinates.map(({ ride, lat, lng }) => {
              if (!initialRegion) return null;
              const x = ((lng - initialRegion.longitude) / initialRegion.longitudeDelta + 0.5) * 100;
              const y = ((initialRegion.latitude - lat) / initialRegion.latitudeDelta + 0.5) * 100;
              const clampedX = Math.min(Math.max(x, 5), 95);
              const clampedY = Math.min(Math.max(y, 5), 95);

              const statusColor = ride.status === "OPEN" 
                ? "#10B981" 
                : ride.status === "IN_TALKS" 
                ? "#EAB308" 
                : ride.status === "BOOKED"
                ? "#3B82F6"
                : "#9CA3AF";

              const isSelected = selectedRide?.id === ride.id;

              return (
                <TouchableOpacity
                  key={ride.id}
                  onPress={() => handleMarkerPress(ride)}
                  className="absolute items-center pointer-events-auto"
                  style={{
                    left: `${clampedX}%`,
                    top: `${clampedY}%`,
                    transform: [{ translateX: -20 }, { translateY: -40 }],
                  }}
                >
                  <View 
                    style={{
                      backgroundColor: 'white',
                      borderWidth: 2,
                      borderColor: isSelected ? '#4F46E5' : '#6366F1',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Text 
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: isSelected ? '#312E81' : '#4338CA',
                      }}
                    >
                      {format(ride.priceTotal)}
                    </Text>
                  </View>
                  <View 
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: statusColor,
                      borderWidth: 3,
                      borderColor: 'white',
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Sheet for Ride Details */}
          {selectedRide && (
            <BottomSheet
              ref={bottomSheetRef}
              index={-1}
              snapPoints={snapPoints}
              enablePanDownToClose
              backgroundStyle={{ backgroundColor: "#fff" }}
            >
              <View className="flex-1 px-4">
                <View className="items-center mb-4">
                  <View className="w-12 h-1 bg-gray-300 rounded-full" />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="mb-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900">
                          {selectedRide.pickupLabel} → {selectedRide.dropLabel}
                        </Text>
                        {selectedRide.title && (
                          <Text className="text-sm text-gray-600 mt-1">{selectedRide.title}</Text>
                        )}
                      </View>
                      <RideStatusBadge status={selectedRide.status} />
                    </View>
                    
                    <View className="flex-row items-baseline justify-between mt-3">
                      <Text className="text-2xl font-bold text-blue-600">{format(selectedRide.priceTotal)}</Text>
                      <Text className="text-sm text-gray-500">{formatDepartTime(selectedRide.departAt)}</Text>
                    </View>
                    
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-sm text-gray-600">
                        {selectedRide.routeDistanceMiles.toFixed(1)} miles
                      </Text>
                      {selectedRide.seatsTotal ? (
                        <Text className="text-sm text-gray-600">{selectedRide.seatsTotal} seats</Text>
                      ) : selectedRide.seatsNeeded ? (
                        <Text className="text-sm text-gray-600">{selectedRide.seatsNeeded} needed</Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleViewDetails}
                    className="bg-blue-600 rounded-xl py-3 mt-2"
                  >
                    <Text className="text-white text-center font-semibold">View Details</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </BottomSheet>
          )}
        </View>
      );
    }
  }

  // Native platforms - use react-native-maps
  const NativeMapView = MapView as React.ComponentType<any>;
  const NativeMarker = Marker as React.ComponentType<any>;

  return (
    <View className="flex-1 relative">
      {/* Google Maps */}
      <NativeMapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
        className="rounded-3xl overflow-hidden"
      >
        {coordinates.map(({ ride, lat, lng }) => {
          const statusColor = ride.status === "OPEN" 
            ? "#10B981" // green-500
            : ride.status === "IN_TALKS" 
            ? "#EAB308" // yellow-500
            : ride.status === "BOOKED"
            ? "#3B82F6" // blue-500
            : "#9CA3AF"; // gray-400

          const isSelected = selectedRide?.id === ride.id;

          return (
            <NativeMarker
              key={ride.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => handleMarkerPress(ride)}
            >
              <View style={{ alignItems: 'center' }}>
                <View 
                  style={{
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#4F46E5' : '#6366F1',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginBottom: 4,
                  }}
                >
                  <Text 
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: isSelected ? '#312E81' : '#4338CA',
                    }}
                  >
                    {format(ride.priceTotal)}
                  </Text>
                </View>
                <View 
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: statusColor,
                    borderWidth: 3,
                    borderColor: 'white',
                    ...(Platform.OS === 'web' ? {
                      boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)',
                    } : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }),
                  }}
                />
              </View>
            </NativeMarker>
          );
        })}
      </NativeMapView>

      {/* Bottom Sheet for Ride Details */}
      {selectedRide && (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: "#fff" }}
        >
          <View className="flex-1 px-4">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      {selectedRide.pickupLabel} → {selectedRide.dropLabel}
                    </Text>
                    {selectedRide.title && (
                      <Text className="text-sm text-gray-600 mt-1">{selectedRide.title}</Text>
                    )}
                  </View>
                  <RideStatusBadge status={selectedRide.status} />
                </View>
                
                <View className="flex-row items-baseline justify-between mt-3">
                  <Text className="text-2xl font-bold text-blue-600">{format(selectedRide.priceTotal)}</Text>
                  <Text className="text-sm text-gray-500">{formatDepartTime(selectedRide.departAt)}</Text>
                </View>
                
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm text-gray-600">
                    {selectedRide.routeDistanceMiles.toFixed(1)} miles
                  </Text>
                  {selectedRide.seatsTotal ? (
                    <Text className="text-sm text-gray-600">{selectedRide.seatsTotal} seats</Text>
                  ) : selectedRide.seatsNeeded ? (
                    <Text className="text-sm text-gray-600">{selectedRide.seatsNeeded} needed</Text>
                  ) : null}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleViewDetails}
                className="bg-blue-600 rounded-xl py-3 mt-2"
              >
                <Text className="text-white text-center font-semibold">View Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}


