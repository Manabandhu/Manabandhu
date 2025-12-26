import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';

interface OfferRideBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onRideOffered?: () => void;
}

export default function OfferRideBottomSheet({ visible, onClose, onRideOffered }: OfferRideBottomSheetProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFrom('');
    setTo('');
    setDate('');
    setTime('');
    setSeats('');
    setPrice('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please fill in departure and destination locations');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement rides API call
      // await ridesAPI.offerRide({ from, to, date, time, seats: parseInt(seats), price: parseFloat(price) });
      
      resetForm();
      onClose();
      onRideOffered?.();
      Alert.alert('Success', 'Ride offer posted successfully!');
    } catch (error) {
      console.error('Failed to offer ride:', error);
      Alert.alert('Error', 'Failed to post ride offer. Please try again.');
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
            <Text className="text-lg font-semibold">Offer Ride</Text>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading || !from.trim() || !to.trim()}
              className={`px-4 py-2 rounded-full ${
                loading || !from.trim() || !to.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className={`font-semibold ${
                loading || !from.trim() || !to.trim() ? 'text-gray-500' : 'text-white'
              }`}>
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">From *</Text>
              <TextInput
                value={from}
                onChangeText={setFrom}
                placeholder="Departure location"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">To *</Text>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="Destination"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Date</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="MM/DD/YYYY"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Time</Text>
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM AM/PM"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Available Seats</Text>
                <TextInput
                  value={seats}
                  onChangeText={setSeats}
                  placeholder="1-4"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Price per Seat</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="$0.00"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                />
              </View>
            </View>

            <View className="mt-4 p-4 bg-gray-50 rounded-lg mb-6">
              <Text className="text-gray-600 text-sm font-medium mb-2">Safety Guidelines</Text>
              <Text className="text-gray-500 text-xs leading-5">
                • Meet in public places for pickup{'\n'}
                • Verify passenger identity before departure{'\n'}
                • Share trip details with trusted contacts{'\n'}
                • Follow local traffic laws and safety regulations
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}