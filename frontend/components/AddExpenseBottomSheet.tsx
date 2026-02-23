import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SplitIcon } from '@/shared/components/ui/Icons';
import { expensesAPI, ExpenseCategory } from '@/shared/api/expenses';

interface AddExpenseBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
}

export default function AddExpenseBottomSheet({ visible, onClose, onExpenseAdded }: AddExpenseBottomSheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setCategory(ExpenseCategory.OTHER);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await expensesAPI.createExpense({
        title: title.trim(),
        description: description.trim() || undefined,
        amount: amountValue,
        category: category,
        expenseDate: new Date().toISOString(),
      });
      
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
          className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-[70%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-600 dark:text-blue-400 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">Add Expense</Text>
            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading || !amount.trim() || !title.trim()}
              className={`px-4 py-2 rounded-full ${
                loading || !amount.trim() || !title.trim() ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className={`font-semibold ${
                loading || !amount.trim() || !title.trim() ? 'text-gray-500' : 'text-white'
              }`}>
                {loading ? 'Saving...' : 'Save'}
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
                placeholder="e.g. Groceries, Uber ride"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

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
              <Text className="text-gray-700 font-medium mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                multiline
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {Object.values(ExpenseCategory).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full ${
                      category === cat ? 'bg-indigo-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`font-semibold text-sm ${
                      category === cat ? 'text-white' : 'text-gray-700'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
