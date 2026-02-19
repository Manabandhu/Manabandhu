import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function EditProfile() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    city: user?.city || '',
    country: user?.country || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Edit Profile
        </Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-full ${
            loading ? 'bg-gray-300' : 'bg-blue-600'
          }`}
        >
          <Text className={`font-semibold ${
            loading ? 'text-gray-500' : 'text-white'
          }`}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Display Name */}
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Display Name</Text>
          <TextInput
            value={formData.displayName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
            placeholder="Enter your display name"
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
          />
        </View>

        {/* City */}
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">City</Text>
          <TextInput
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            placeholder="Enter your city"
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
          />
        </View>

        {/* Country */}
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Country</Text>
          <TextInput
            value={formData.country}
            onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
            placeholder="Enter your country"
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
          />
        </View>

        {/* Email (Read-only) */}
        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Email</Text>
          <TextInput
            value={user?.email || ''}
            editable={false}
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-500"
          />
          <Text className="text-gray-400 text-sm mt-1">Email cannot be changed</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}