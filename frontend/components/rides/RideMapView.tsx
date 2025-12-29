import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { RidePost } from "@/types";
import { openMapsDirectionsWithCoords } from "@/lib/maps";
import { MapPinIcon } from "@/components/ui/Icons";
// Platform-specific imports
// @ts-ignore - Platform-specific file resolution
import { MapView, Marker, Polyline, PROVIDER_GOOGLE } from "../rooms/MapComponents";

interface RideMapViewProps {
  ride: RidePost;
  height?: number;
  showRoute?: boolean;
}

// Decode polyline string to coordinates
const decodePolyline = (encoded: string): Array<{ latitude: number; longitude: number }> => {
  if (!encoded) return [];
  
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    poly.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }

  return poly;
};

export default function RideMapView({ ride, height = 300, showRoute = true }: RideMapViewProps) {
  const routeCoordinates = useMemo(() => {
    if (showRoute && ride.routePolyline) {
      return decodePolyline(ride.routePolyline);
    }
    return [];
  }, [ride.routePolyline, showRoute]);

  const region = useMemo(() => {
    const lats = [ride.pickupLat, ride.dropLat];
    const lngs = [ride.pickupLng, ride.dropLng];
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
  }, [ride]);

  const handleOpenDirections = async () => {
    try {
      await openMapsDirectionsWithCoords(
        ride.pickupLat,
        ride.pickupLng,
        ride.dropLat,
        ride.dropLng
      );
    } catch (error) {
      console.error("Error opening maps:", error);
    }
  };

  // Web fallback
  if (Platform.OS === 'web') {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || (typeof window !== 'undefined' && (window as any).__GOOGLE_MAPS_API_KEY__);
    const center = `${region.latitude},${region.longitude}`;
    
    if (apiKey) {
      // Create a directions URL with waypoints
      const origin = `${ride.pickupLat},${ride.pickupLng}`;
      const destination = `${ride.dropLat},${ride.dropLng}`;
      const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&zoom=12`;
      
      return (
        <View className="bg-gray-100 rounded-2xl overflow-hidden relative" style={{ height }}>
          <iframe
            src={mapUrl}
            style={{ width: '100%', height: '100%', border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Floating button to open directions in new tab */}
          <TouchableOpacity
            onPress={handleOpenDirections}
            className="absolute bottom-4 right-4 bg-blue-600 rounded-full px-4 py-3 flex-row items-center shadow-lg z-10"
            style={{
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
            activeOpacity={0.8}
          >
            <MapPinIcon size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2 text-sm">Open in Maps</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Fallback without API key - show button to open directions
    return (
      <View className="bg-gray-100 rounded-2xl items-center justify-center relative" style={{ height }}>
        <Text className="text-gray-500 mb-4">Map preview unavailable</Text>
        <TouchableOpacity
          onPress={handleOpenDirections}
          className="bg-blue-600 rounded-full px-4 py-3 flex-row items-center"
          activeOpacity={0.8}
        >
          <MapPinIcon size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2 text-sm">Open Directions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Native platforms - use react-native-maps
  if (!MapView || !Marker) {
    return (
      <View className="bg-gray-100 rounded-2xl items-center justify-center" style={{ height }}>
        <Text className="text-gray-500">Map preview unavailable</Text>
      </View>
    );
  }

  const NativeMapView = MapView as React.ComponentType<any>;
  const NativeMarker = Marker as React.ComponentType<any>;
  const NativePolyline = Polyline as React.ComponentType<any>;

  return (
    <View className="bg-gray-100 rounded-2xl overflow-hidden relative" style={{ height }}>
      <NativeMapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        mapType="standard"
        scrollEnabled={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        showsZoomControls={Platform.OS === 'android'}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {/* Route polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <NativePolyline
            coordinates={routeCoordinates}
            strokeColor="#2563EB"
            strokeWidth={4}
            lineDashPattern={[]}
          />
        )}
        
        {/* Fallback line if no polyline */}
        {showRoute && routeCoordinates.length === 0 && (
          <NativePolyline
            coordinates={[
              { latitude: ride.pickupLat, longitude: ride.pickupLng },
              { latitude: ride.dropLat, longitude: ride.dropLng },
            ]}
            strokeColor="#2563EB"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Pickup marker */}
        <NativeMarker
          coordinate={{ latitude: ride.pickupLat, longitude: ride.pickupLng }}
          title="Pickup"
          description={ride.pickupLabel}
        >
          <View style={{ alignItems: 'center' }}>
            <View 
              style={{
                backgroundColor: '#10B981',
                width: 24,
                height: 24,
                borderRadius: 12,
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

        {/* Drop marker */}
        <NativeMarker
          coordinate={{ latitude: ride.dropLat, longitude: ride.dropLng }}
          title="Drop-off"
          description={ride.dropLabel}
        >
          <View style={{ alignItems: 'center' }}>
            <View 
              style={{
                backgroundColor: '#F97316',
                width: 24,
                height: 24,
                borderRadius: 12,
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
      </NativeMapView>
      
      {/* Floating button to open directions */}
      <TouchableOpacity
        onPress={handleOpenDirections}
        className="absolute bottom-4 right-4 bg-blue-600 rounded-full px-4 py-3 flex-row items-center shadow-lg"
        style={{
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
        activeOpacity={0.8}
      >
        <MapPinIcon size={18} color="#FFFFFF" />
        <Text className="text-white font-semibold ml-2 text-sm">Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

