import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { auth } from '@/lib/firebase';

interface PostRoomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onRoomPosted?: () => void;
}

export default function PostRoomBottomSheet({ visible, onClose, onRoomPosted }: PostRoomBottomSheetProps) {
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('APARTMENT');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const roomTypes = ['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM'];

  const resetForm = () => {
    setTitle('');
    setRent('');
    setLocation('');
    setDescription('');
    setType('APARTMENT');
    setContactInfo('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !rent.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          rent: parseFloat(rent),
          type,
          contactInfo: contactInfo.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post room');
      }
      
      resetForm();
      onClose();
      onRoomPosted?.();
      Alert.alert('Success', 'Room listing posted successfully!');
    } catch (error) {
      console.error('Failed to post room:', error);
      Alert.alert('Error', 'Failed to post room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end"
        onPress={handleClose}
      >
        <Pressable 
          className="bg-white rounded-t-3xl max-h-[85%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-600 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Post Room</Text>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading || !title.trim() || !rent.trim()}
              className={`px-4 py-2 rounded-full ${
                loading || !title.trim() || !rent.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className={`font-semibold ${
                loading || !title.trim() || !rent.trim() ? 'text-gray-500' : 'text-white'
              }`}>
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Spacious 2BR apartment in downtown"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Monthly Rent *</Text>
              <TextInput
                value={rent}
                onChangeText={setRent}
                placeholder="e.g. 1200"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Room Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {roomTypes.map((roomType) => (
                    <TouchableOpacity
                      key={roomType}
                      onPress={() => setType(roomType)}
                      className={`px-4 py-2 rounded-full border ${
                        type === roomType 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text className={`font-medium ${
                        type === roomType ? 'text-white' : 'text-gray-700'
                      }`}>
                        {roomType.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Downtown, City Center"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Contact Info</Text>
              <TextInput
                value={contactInfo}
                onChangeText={setContactInfo}
                placeholder="Phone number or email"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the room, amenities, requirements..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mt-4 p-4 bg-gray-50 rounded-lg mb-6">
              <Text className="text-gray-600 text-sm font-medium mb-2">Posting Guidelines</Text>
              <Text className="text-gray-500 text-xs leading-5">
                • Provide accurate information about the property{'\n'}
                • Include clear pricing and availability{'\n'}
                • Be honest about requirements and restrictions{'\n'}
                • No discriminatory language
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}