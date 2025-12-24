import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { CreditCardIcon, UsersIcon, DollarSignIcon, SplitIcon } from "@/components/ui/Icons";
import AddExpenseBottomSheet from "@/components/AddExpenseBottomSheet";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
}

const mockExpenses: Expense[] = [
  { id: '1', title: 'Groceries', amount: 85.50, category: 'Food', date: '2024-12-20', paidBy: 'You' },
  { id: '2', title: 'Uber ride', amount: 25.00, category: 'Transport', date: '2024-12-19', paidBy: 'John' },
  { id: '3', title: 'Dinner', amount: 120.00, category: 'Food', date: '2024-12-18', paidBy: 'Sarah' },
];

const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function ExpensesDashboard() {
  const router = useRouter();
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddExpenseSheet, setShowAddExpenseSheet] = useState(false);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const yourShare = totalExpenses / 3; // Assuming 3 people split

  const filteredExpenses = selectedCategory === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === selectedCategory);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-900">Expenses</Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-full"
          onPress={() => setShowAddExpenseSheet(true)}
        >
          <Text className="text-white font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="flex-row mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
          <View className="flex-row items-center mb-2">
            <DollarSignIcon size={20} color="#10B981" />
            <Text className="text-gray-600 ml-2 font-medium">Total</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            ${totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
          <View className="flex-row items-center mb-2">
            <UsersIcon size={20} color="#3B82F6" />
            <Text className="text-gray-600 ml-2 font-medium">Your Share</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            ${yourShare.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <TouchableOpacity
          className={`px-4 py-2 rounded-full mr-3 ${
            selectedCategory === 'All' ? 'bg-blue-600' : 'bg-white'
          }`}
          onPress={() => setSelectedCategory('All')}
        >
          <Text className={`font-medium ${
            selectedCategory === 'All' ? 'text-white' : 'text-gray-700'
          }`}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-4 py-2 rounded-full mr-3 ${
              selectedCategory === category ? 'bg-blue-600' : 'bg-white'
            }`}
            onPress={() => setSelectedCategory(category)}
          >
            <Text className={`font-medium ${
              selectedCategory === category ? 'text-white' : 'text-gray-700'
            }`}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <CreditCardIcon size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-lg mt-4">No expenses found</Text>
          <Text className="text-gray-400 text-sm mt-2">Add your first expense to get started</Text>
        </View>
      ) : (
        filteredExpenses.map((expense) => (
          <View key={expense.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {expense.title}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {expense.category} • Paid by {expense.paidBy}
                </Text>
              </View>
              <Text className="text-xl font-bold text-green-600">
                ${expense.amount.toFixed(2)}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              {new Date(expense.date).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}

      {/* Quick Actions */}
      <View className="mt-6 mb-8">
        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity 
            className="flex-1 bg-green-600 rounded-xl p-4 items-center"
            onPress={() => router.push('/splitly')}
          >
            <SplitIcon size={20} color="#FFFFFF" />
            <Text className="text-white font-medium text-sm mt-1">Split with Splitly</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="bg-gray-100 rounded-xl p-4">
          <Text className="text-gray-900 text-center font-medium">
            📊 View Detailed Reports
          </Text>
        </TouchableOpacity>
      </View>

      <AddExpenseBottomSheet 
        visible={showAddExpenseSheet}
        onClose={() => setShowAddExpenseSheet(false)}
        onExpenseAdded={() => {/* TODO: Refresh expenses */}}
      />
    </ScrollView>
  );
}


