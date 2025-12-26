import React, { useMemo, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Platform } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { RoomListingSummary } from "@/types";
import { MapPinIcon, HomeIcon } from "@/components/ui/Icons";
// Platform-specific imports - Metro will resolve .native.ts or .web.ts automatically
// @ts-ignore - Platform-specific file resolution
import { MapView, Marker, PROVIDER_GOOGLE } from "./MapComponents";

interface RoomMapCanvasProps {
  listings: RoomListingSummary[];
  onSelect: (listing: RoomListingSummary) => void;
}

const hashToOffset = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 1000;
  }
  const offset = (hash % 20) / 10000;
  return offset;
};

const getDisplayCoordinates = (listing: RoomListingSummary) => {
  if (listing.locationExactEnabled && listing.latExact && listing.lngExact) {
    return { lat: listing.latExact, lng: listing.lngExact };
  }
  const offset = hashToOffset(listing.id);
  return {
    lat: listing.latApprox + offset,
    lng: listing.lngApprox - offset,
  };
};

export default function RoomMapCanvas({ listings, onSelect }: RoomMapCanvasProps) {
  const [selectedListing, setSelectedListing] = useState<RoomListingSummary | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const coordinates = useMemo(() => listings.map((listing) => ({
    listing,
    ...getDisplayCoordinates(listing),
  })), [listings]);

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
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [coordinates]);

  const handleMarkerPress = useCallback((listing: RoomListingSummary) => {
    setSelectedListing(listing);
    bottomSheetRef.current?.expand();
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedListing) {
      onSelect(selectedListing);
    }
  }, [selectedListing, onSelect]);

  if (!initialRegion) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 rounded-3xl">
        <HomeIcon size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-base mt-4">No listings in this area</Text>
      </View>
    );
  }

  // Web fallback - use Google Maps embed or static visualization
  if (Platform.OS === 'web') {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || (typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY__);
    const center = `${initialRegion.latitude},${initialRegion.longitude}`;
    
    // Try to use Google Maps embed if API key is available
    if (apiKey) {
      const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center}&zoom=13`;
      
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
            {coordinates.map(({ listing, lat, lng }) => {
              if (!initialRegion) return null;
              const x = ((lng - initialRegion.longitude) / initialRegion.longitudeDelta + 0.5) * 100;
              const y = ((initialRegion.latitude - lat) / initialRegion.latitudeDelta + 0.5) * 100;
              const clampedX = Math.min(Math.max(x, 5), 95);
              const clampedY = Math.min(Math.max(y, 5), 95);

              const statusColor = listing.status === "AVAILABLE" 
                ? "#10B981" 
                : listing.status === "IN_TALKS" 
                ? "#EAB308" 
                : "#9CA3AF";

              const isSelected = selectedListing?.id === listing.id;

              return (
                <TouchableOpacity
                  key={listing.id}
                  onPress={() => handleMarkerPress(listing)}
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
                      ₹{listing.rentMonthly}
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

          {/* Bottom Sheet for Listing Details */}
          {selectedListing && (
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
                  {/* Listing Image */}
                  <View className="relative mb-4 rounded-2xl overflow-hidden" style={{ height: 200 }}>
                    {selectedListing.imageUrls?.[0] ? (
                      <Image 
                        source={{ uri: selectedListing.imageUrls[0] }} 
                        className="w-full h-full" 
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                        <HomeIcon size={48} color="#9CA3AF" />
                      </View>
                    )}
                    <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Text className="text-2xl font-bold text-indigo-600">₹{selectedListing.rentMonthly}</Text>
                      <Text className="text-xs text-gray-500">per month</Text>
                    </View>
                  </View>

                  {/* Listing Info */}
                  <View className="mb-4">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</Text>
                    <View className="flex-row items-center mb-3">
                      <MapPinIcon size={18} color="#6B7280" />
                      <Text className="text-base text-gray-600 ml-2">{selectedListing.approxAreaLabel}</Text>
                    </View>
                    
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                        <Text className="text-sm font-semibold text-indigo-700">{selectedListing.roomType}</Text>
                      </View>
                      {selectedListing.listingFor && (
                        <View className="bg-purple-50 px-3 py-1.5 rounded-lg">
                          <Text className="text-sm font-semibold text-purple-700">{selectedListing.listingFor}</Text>
                        </View>
                      )}
                      <View className={`px-3 py-1.5 rounded-lg ${
                        selectedListing.status === "AVAILABLE" 
                          ? "bg-green-100" 
                          : selectedListing.status === "IN_TALKS" 
                          ? "bg-yellow-100" 
                          : "bg-gray-100"
                      }`}>
                        <Text className={`text-sm font-semibold ${
                          selectedListing.status === "AVAILABLE" 
                            ? "text-green-700" 
                            : selectedListing.status === "IN_TALKS" 
                            ? "text-yellow-700" 
                            : "text-gray-700"
                        }`}>
                          {selectedListing.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={handleViewDetails}
                    className="bg-indigo-600 rounded-xl py-4 items-center mb-6 shadow-lg"
                  >
                    <Text className="text-white font-bold text-lg">View Full Details</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </BottomSheet>
          )}
        </View>
      );
    }
    
    // Fallback: Show a visual map representation without API key
    return (
      <View className="flex-1 relative">
        <View className="flex-1 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 rounded-3xl overflow-hidden border border-blue-200 shadow-lg relative">
          {/* Map Grid Background */}
          <View className="absolute inset-0 opacity-30">
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={`h-${i}`} className="absolute w-full border-t border-blue-200" style={{ top: `${(i + 1) * 12.5}%` }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={`v-${i}`} className="absolute h-full border-l border-blue-200" style={{ left: `${(i + 1) * 12.5}%` }} />
            ))}
          </View>

          {/* Streets/Roads */}
          <View className="absolute inset-0">
            <View className="absolute w-full h-1 bg-blue-300/40 rounded-full" style={{ top: "30%", left: "10%", width: "80%" }} />
            <View className="absolute w-full h-1 bg-blue-300/40 rounded-full" style={{ top: "60%", left: "5%", width: "90%" }} />
            <View className="absolute h-full w-1 bg-blue-300/40 rounded-full" style={{ left: "40%", top: "20%", height: "60%" }} />
            <View className="absolute h-full w-1 bg-blue-300/40 rounded-full" style={{ left: "70%", top: "10%", height: "70%" }} />
          </View>

          {/* Markers */}
          {coordinates.map(({ listing, lat, lng }) => {
            if (!initialRegion) return null;
            const x = ((lng - initialRegion.longitude) / initialRegion.longitudeDelta + 0.5) * 100;
            const y = ((initialRegion.latitude - lat) / initialRegion.latitudeDelta + 0.5) * 100;
            const clampedX = Math.min(Math.max(x, 5), 95);
            const clampedY = Math.min(Math.max(y, 5), 95);

            const statusColor = listing.status === "AVAILABLE" 
              ? "bg-green-500" 
              : listing.status === "IN_TALKS" 
              ? "bg-yellow-500" 
              : "bg-gray-400";

            const isSelected = selectedListing?.id === listing.id;

            return (
              <TouchableOpacity
                key={listing.id}
                onPress={() => handleMarkerPress(listing)}
                className="absolute items-center"
                style={{
                  left: `${clampedX}%`,
                  top: `${clampedY}%`,
                  transform: [{ translateX: -20 }, { translateY: -40 }],
                }}
              >
                {/* Price Badge */}
                <View className={`bg-white border-2 ${isSelected ? 'border-indigo-600' : 'border-indigo-500'} rounded-xl px-3 py-1.5 shadow-xl mb-1`}>
                  <Text className={`text-sm font-bold ${isSelected ? 'text-indigo-800' : 'text-indigo-700'}`}>
                    ₹{listing.rentMonthly}
                  </Text>
                </View>
                {/* Marker Pin */}
                <View className="items-center">
                  <View className={`w-7 h-7 ${statusColor} rounded-full border-3 border-white shadow-xl ${isSelected ? 'ring-2 ring-indigo-400' : ''}`} />
                  <View className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${isSelected ? 'border-t-indigo-600' : 'border-t-indigo-500'}`} style={{ marginTop: -3 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Sheet for Listing Details */}
        {selectedListing && (
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
                {/* Listing Image */}
                <View className="relative mb-4 rounded-2xl overflow-hidden" style={{ height: 200 }}>
                  {selectedListing.imageUrls?.[0] ? (
                    <Image 
                      source={{ uri: selectedListing.imageUrls[0] }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                      <HomeIcon size={48} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Text className="text-2xl font-bold text-indigo-600">₹{selectedListing.rentMonthly}</Text>
                    <Text className="text-xs text-gray-500">per month</Text>
                  </View>
                </View>

                {/* Listing Info */}
                <View className="mb-4">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</Text>
                  <View className="flex-row items-center mb-3">
                    <MapPinIcon size={18} color="#6B7280" />
                    <Text className="text-base text-gray-600 ml-2">{selectedListing.approxAreaLabel}</Text>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                      <Text className="text-sm font-semibold text-indigo-700">{selectedListing.roomType}</Text>
                    </View>
                    {selectedListing.listingFor && (
                      <View className="bg-purple-50 px-3 py-1.5 rounded-lg">
                        <Text className="text-sm font-semibold text-purple-700">{selectedListing.listingFor}</Text>
                      </View>
                    )}
                    <View className={`px-3 py-1.5 rounded-lg ${
                      selectedListing.status === "AVAILABLE" 
                        ? "bg-green-100" 
                        : selectedListing.status === "IN_TALKS" 
                        ? "bg-yellow-100" 
                        : "bg-gray-100"
                    }`}>
                      <Text className={`text-sm font-semibold ${
                        selectedListing.status === "AVAILABLE" 
                          ? "text-green-700" 
                          : selectedListing.status === "IN_TALKS" 
                          ? "text-yellow-700" 
                          : "text-gray-700"
                      }`}>
                        {selectedListing.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={handleViewDetails}
                  className="bg-indigo-600 rounded-xl py-4 items-center mb-6 shadow-lg"
                >
                  <Text className="text-white font-bold text-lg">View Full Details</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </BottomSheet>
        )}
      </View>
    );
  }

  // Native platforms - use react-native-maps
  if (!MapView || !Marker || !PROVIDER_GOOGLE) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 rounded-3xl">
        <HomeIcon size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-base mt-4">Map not available</Text>
      </View>
    );
  }

  // TypeScript now knows MapView and Marker are not null
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
        {coordinates.map(({ listing, lat, lng }) => {
          const statusColor = listing.status === "AVAILABLE" 
            ? "#10B981" // green-500
            : listing.status === "IN_TALKS" 
            ? "#EAB308" // yellow-500
            : "#9CA3AF"; // gray-400

          const isSelected = selectedListing?.id === listing.id;

          return (
            <NativeMarker
              key={listing.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => handleMarkerPress(listing)}
            >
              <View style={{ alignItems: 'center' }}>
                {/* Price Badge - Zillow Style */}
                <View 
                  style={{
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#4F46E5' : '#6366F1',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
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
                    ₹{listing.rentMonthly}
                  </Text>
                </View>
                {/* Custom Pin */}
                <View 
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: statusColor,
                    borderWidth: 3,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    ...(isSelected && {
                      borderWidth: 4,
                      borderColor: '#818CF8',
                    }),
                  }}
                />
                {/* Pin Point */}
                <View 
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 8,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: isSelected ? '#4F46E5' : '#6366F1',
                    marginTop: -3,
                  }}
                />
              </View>
            </NativeMarker>
          );
        })}
      </NativeMapView>

        {/* Bottom Sheet for Listing Details */}
        {selectedListing && (
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
                {/* Listing Image */}
                <View className="relative mb-4 rounded-2xl overflow-hidden" style={{ height: 200 }}>
                  {selectedListing.imageUrls?.[0] ? (
                    <Image 
                      source={{ uri: selectedListing.imageUrls[0] }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                      <HomeIcon size={48} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Text className="text-2xl font-bold text-indigo-600">₹{selectedListing.rentMonthly}</Text>
                    <Text className="text-xs text-gray-500">per month</Text>
                  </View>
                </View>

                {/* Listing Info */}
                <View className="mb-4">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</Text>
                  <View className="flex-row items-center mb-3">
                    <MapPinIcon size={18} color="#6B7280" />
                    <Text className="text-base text-gray-600 ml-2">{selectedListing.approxAreaLabel}</Text>
                  </View>
                  
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    <View className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                      <Text className="text-sm font-semibold text-indigo-700">{selectedListing.roomType}</Text>
                    </View>
                    {selectedListing.listingFor && (
                      <View className="bg-purple-50 px-3 py-1.5 rounded-lg">
                        <Text className="text-sm font-semibold text-purple-700">{selectedListing.listingFor}</Text>
                      </View>
                    )}
                    <View className={`px-3 py-1.5 rounded-lg ${
                      selectedListing.status === "AVAILABLE" 
                        ? "bg-green-100" 
                        : selectedListing.status === "IN_TALKS" 
                        ? "bg-yellow-100" 
                        : "bg-gray-100"
                    }`}>
                      <Text className={`text-sm font-semibold ${
                        selectedListing.status === "AVAILABLE" 
                          ? "text-green-700" 
                          : selectedListing.status === "IN_TALKS" 
                          ? "text-yellow-700" 
                          : "text-gray-700"
                      }`}>
                        {selectedListing.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={handleViewDetails}
                  className="bg-indigo-600 rounded-xl py-4 items-center mb-6 shadow-lg"
                >
                  <Text className="text-white font-bold text-lg">View Full Details</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </BottomSheet>
        )}
      </View>
    );
}
