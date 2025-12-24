import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SplitIcon } from '@/components/ui/Icons';

interface AddExpenseBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
}

export default function AddExpenseBottomSheet({ visible, onClose, onExpenseAdded }: AddExpenseBottomSheetProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setAmount('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!amount.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement expense API call
      // await expensesAPI.createExpense({ amount: parseFloat(amount), description });
      
      resetForm();
      onClose();
      onExpenseAdded?.();
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
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
          className="bg-white rounded-t-3xl max-h-[70%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-600 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Add Expense</Text>
            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading || !amount.trim() || !description.trim()}
              className={`px-4 py-2 rounded-full ${
                loading || !amount.trim() || !description.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className={`font-semibold ${
                loading || !amount.trim() || !description.trim() ? 'text-gray-500' : 'text-white'
              }`}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Amount *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Description *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What was this expense for?"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-900 font-semibold mb-2">Split Options</Text>
              <Text className="text-gray-600 text-sm mb-3">
                Split equally among group members or customize splits for specific participants.
              </Text>
              <TouchableOpacity 
                className="bg-green-600 rounded-lg p-3 flex-row items-center justify-center"
                onPress={() => {
                  onClose();
                  router.push('/splitly');
                }}
              >
                <SplitIcon size={16} color="#FFFFFF" />
                <Text className="text-white font-medium ml-2">Use Splitly for Advanced Splitting</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}