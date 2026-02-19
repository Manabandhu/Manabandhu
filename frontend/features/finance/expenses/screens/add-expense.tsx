import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">Add Expense</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />
      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Description"
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
      />

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <Text className="text-gray-900 dark:text-white font-semibold">Split options</Text>
        <Text className="text-gray-600 dark:text-gray-400">
          Placeholder for equal/custom splits, participants selection.
        </Text>
      </View>

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3">
        <Text className="text-white text-center font-semibold">Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


