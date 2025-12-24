import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SplitIcon, UsersIcon, DollarSignIcon, PlusIcon } from '@/components/ui/Icons';

interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  yourBalance: number;
}

interface RecentActivity {
  id: string;
  type: 'expense' | 'payment';
  description: string;
  amount: number;
  date: string;
  group: string;
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Roommates',
    members: ['You', 'John', 'Sarah'],
    totalExpenses: 450.00,
    yourBalance: -25.50
  },
  {
    id: '2',
    name: 'Weekend Trip',
    members: ['You', 'Mike', 'Lisa', 'Tom'],
    totalExpenses: 320.00,
    yourBalance: 15.75
  }
];

const mockActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'expense',
    description: 'Groceries',
    amount: 85.50,
    date: '2024-12-20',
    group: 'Roommates'
  },
  {
    id: '2',
    type: 'payment',
    description: 'Paid John',
    amount: 42.25,
    date: '2024-12-19',
    group: 'Roommates'
  }
];

export default function Splitly() {
  const router = useRouter();
  const [groups] = useState<Group[]>(mockGroups);
  const [activity] = useState<RecentActivity[]>(mockActivity);

  const totalBalance = groups.reduce((sum, group) => sum + group.yourBalance, 0);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <SplitIcon size={32} color="#10B981" />
          <Text className="text-3xl font-bold text-gray-900 ml-2">Splitly</Text>
        </View>
        <TouchableOpacity
          className="bg-green-600 px-4 py-2 rounded-full"
          onPress={() => router.push('/splitly/create-group')}
        >
          <Text className="text-white font-semibold">+ Group</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Summary */}
      <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <Text className="text-gray-600 text-sm font-medium mb-2">Your Overall Balance</Text>
        <Text className={`text-3xl font-bold ${
          totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {totalBalance >= 0 ? '+' : ''}${Math.abs(totalBalance).toFixed(2)}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {totalBalance >= 0 ? 'You are owed' : 'You owe'}
        </Text>
      </View>

      {/* Groups */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Your Groups</Text>
        {groups.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <UsersIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">No groups yet</Text>
            <Text className="text-gray-400 text-sm mt-2">Create a group to start splitting expenses</Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              onPress={() => router.push(`/splitly/group/${group.id}`)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    {group.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {group.members.length} members
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-bold ${
                    group.yourBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {group.yourBalance >= 0 ? '+' : ''}${Math.abs(group.yourBalance).toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Total: ${group.totalExpenses.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center mt-2">
                <UsersIcon size={16} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {group.members.join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Activity */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
        {activity.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <DollarSignIcon size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">No recent activity</Text>
          </View>
        ) : (
          activity.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {item.description}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {item.group} • {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-bold ${
                    item.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 text-xs capitalize">
                    {item.type}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            className="flex-1 bg-blue-600 rounded-xl p-4 items-center"
            onPress={() => router.push('/splitly/add-expense')}
          >
            <PlusIcon size={24} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-green-600 rounded-xl p-4 items-center"
            onPress={() => router.push('/splitly/settle-up')}
          >
            <DollarSignIcon size={24} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Settle Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}