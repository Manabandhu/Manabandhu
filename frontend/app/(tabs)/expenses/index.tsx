import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const groups = [
  { id: "1", name: "Housemates", balance: "-$45" },
  { id: "2", name: "Trip", balance: "+$20" },
];

export default function ExpensesDashboard() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Expenses
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        Dashboard, groups, split, balance summary, settlement, history.
      </Text>

      {groups.map((group) => (
        <View
          key={group.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {group.name}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">Balance: {group.balance}</Text>
        </View>
      ))}

      <TouchableOpacity
        className="bg-blue-600 rounded-xl py-3 mt-2"
        onPress={() => router.push("/(tabs)/expenses/add-expense")}
      >
        <Text className="text-white text-center font-semibold">Add Expense</Text>
      </TouchableOpacity>

      <View className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Balance Summary & Settlement
        </Text>
        <Text className="text-gray-600 dark:text-gray-400">
          Placeholder for balances, settlements, transaction history.
        </Text>
      </View>
    </ScrollView>
  );
}


