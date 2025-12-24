import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { uscisApi } from '@/lib/api/uscis';

export default function AddCaseScreen() {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validateReceiptNumber = (number: string) => {
    const pattern = /^[A-Z]{3}\d{10}$/;
    return pattern.test(number);
  };

  const handleAddCase = async () => {
    if (!receiptNumber.trim()) {
      Alert.alert('Error', 'Please enter a receipt number');
      return;
    }

    if (!validateReceiptNumber(receiptNumber.trim().toUpperCase())) {
      Alert.alert(
        'Invalid Format',
        'Receipt number must be 3 letters followed by 10 digits (e.g., IOE0912345678)'
      );
      return;
    }

    setLoading(true);
    try {
      await uscisApi.addCase({ receiptNumber: receiptNumber.trim().toUpperCase() });
      Alert.alert('Success', 'Case added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        <View className="px-4 py-6 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">Add Case</Text>
              <Text className="text-gray-600 mt-1">Track a new USCIS case</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 px-4 py-6">
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-blue-900">
                  Receipt Number Format
                </Text>
                <Text className="text-sm text-blue-700 mt-1">
                  Enter your 13-character receipt number (e.g., IOE0912345678)
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-base font-medium text-gray-900 mb-2">
              Receipt Number
            </Text>
            <TextInput
              value={receiptNumber}
              onChangeText={setReceiptNumber}
              placeholder="IOE0912345678"
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={13}
            />
            <Text className="text-sm text-gray-500 mt-2">
              3 letters followed by 10 digits
            </Text>
          </View>

          <View className="mt-8">
            <TouchableOpacity
              onPress={handleAddCase}
              disabled={loading}
              className={`py-4 rounded-lg ${
                loading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white text-center font-semibold text-base">
                {loading ? 'Adding Case...' : 'Track Case'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              Supported Forms
            </Text>
            <Text className="text-sm text-gray-600">
              I-129, I-130, I-140, I-485, I-765, I-539, I-131, and other USCIS forms
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}