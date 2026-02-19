import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { MapPinIcon, XIcon } from '@/shared/components/ui/Icons';
import * as Location from 'expo-location';
import { checkLocationPermission, requestLocationPermission } from '@/lib/permissions';

interface LocationPickerProps {
  label: string;
  placeholder: string;
  value: {
    label: string;
    lat?: number;
    lng?: number;
  };
  onChange: (location: { label: string; lat: number; lng: number }) => void;
  required?: boolean;
}

export default function LocationPicker({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false 
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission',
            'Location permission is needed to use your current location. You can enable it in settings.'
          );
          setLoading(false);
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressLabel = address
        ? `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.postalCode || ''}`.trim() || 
          `${address.city || ''}, ${address.region || ''}`.trim() ||
          'Current Location'
        : 'Current Location';

      onChange({
        label: addressLabel,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      setShowMapModal(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    try {
      setLoading(true);
      
      // Use geocoding to convert address to coordinates
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length === 0) {
        Alert.alert('Not Found', 'Could not find that location. Please try a different search.');
        setLoading(false);
        return;
      }

      const result = results[0];
      onChange({
        label: searchQuery.trim(),
        lat: result.latitude,
        lng: result.longitude,
      });

      setSearchQuery('');
      setShowMapModal(false);
    } catch (error) {
      console.error('Error geocoding location:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange({ label: '', lat: undefined, lng: undefined });
  };

  return (
    <View>
      <View className="flex-row items-center mb-2">
        <Text className="text-base font-semibold text-gray-900">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <TextInput
            value={value.label}
            onChangeText={(text) => onChange({ ...value, label: text })}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            editable={false}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowMapModal(true)}
          className="bg-blue-600 px-4 py-3 rounded-xl items-center justify-center"
        >
          <MapPinIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        {value.label && (
          <TouchableOpacity
            onPress={handleClear}
            className="bg-gray-200 px-4 py-3 rounded-xl items-center justify-center"
          >
            <XIcon size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {value.lat !== undefined && value.lng !== undefined && (
        <View className="mt-2 flex-row gap-2">
          <Text className="text-xs text-gray-500">
            Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
          </Text>
        </View>
      )}

      <Modal
        visible={showMapModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Select {label}</Text>
              <TouchableOpacity onPress={() => setShowMapModal(false)}>
                <XIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Search Location</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="e.g., Downtown San Francisco, Airport"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                  onSubmitEditing={handleSearchLocation}
                />
                <TouchableOpacity
                  onPress={handleSearchLocation}
                  disabled={loading || !searchQuery.trim()}
                  className="bg-blue-600 px-4 py-3 rounded-xl items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Search</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center bg-blue-50 rounded-2xl p-4 mb-4"
              onPress={handleUseCurrentLocation}
              disabled={loading}
            >
              <MapPinIcon size={20} color="#4F46E5" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-blue-600">Use Current Location</Text>
                <Text className="text-xs text-gray-500 mt-1">Get location using GPS</Text>
              </View>
              {loading && <ActivityIndicator color="#4F46E5" />}
            </TouchableOpacity>

            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                <Text className="font-semibold">Tip:</Text> You can search for:
              </Text>
              <Text className="text-xs text-gray-500">
                • Addresses (e.g., "123 Main St, San Francisco"){'\n'}
                • Landmarks (e.g., "Golden Gate Bridge"){'\n'}
                • Places (e.g., "San Francisco Airport"){'\n'}
                • Or use your current location
              </Text>
            </View>

            <TouchableOpacity
              className="bg-gray-100 rounded-2xl py-3"
              onPress={() => setShowMapModal(false)}
            >
              <Text className="text-center text-base font-semibold text-gray-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


