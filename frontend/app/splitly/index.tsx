import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SplitIcon, UsersIcon, DollarSignIcon, PlusIcon, CalendarIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { useCurrency } from '@/lib/currency';

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
  const insets = useSafeAreaInsets();
  const { format } = useCurrency();
  const [groups] = useState<Group[]>(mockGroups);
  const [activity] = useState<RecentActivity[]>(mockActivity);
  const [refreshing, setRefreshing] = useState(false);

  const totalBalance = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.yourBalance, 0);
  }, [groups]);

  const totalExpenses = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.totalExpenses, 0);
  }, [groups]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <SplitIcon size={28} color="#10B981" />
                <Text className="text-3xl font-bold text-gray-900 ml-2">Splitly</Text>
              </View>
              <Text className="text-sm text-gray-500 mt-1">Split expenses with friends</Text>
            </View>
            <TouchableOpacity
              className="bg-green-600 px-5 py-3 rounded-xl shadow-md flex-row items-center"
              onPress={() => router.push('/splitly/create-group')}
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Group</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              <View className="bg-green-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#10B981" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Your Balance</Text>
                <Text className={`text-white text-2xl font-bold ${totalBalance >= 0 ? '' : ''}`}>
                  {totalBalance >= 0 ? '+' : ''}{format(Math.abs(totalBalance))}
                </Text>
                <Text className="text-white/80 text-xs mt-1">
                  {totalBalance >= 0 ? 'You are owed' : 'You owe'}
                </Text>
              </View>
              <View className="bg-blue-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#3B82F6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Total Expenses</Text>
                <Text className="text-white text-2xl font-bold">{format(totalExpenses)}</Text>
              </View>
              <View className="bg-purple-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#8B5CF6" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Groups</Text>
                <Text className="text-white text-3xl font-bold">{groups.length}</Text>
              </View>
              <View className="bg-amber-600 rounded-2xl px-5 py-4 min-w-[140px] shadow-md" style={{ backgroundColor: "#F59E0B" }}>
                <Text className="text-white/90 text-xs font-medium mb-1">Recent Activity</Text>
                <Text className="text-white text-3xl font-bold">{activity.length}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Groups */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Your Groups</Text>
            <Text className="text-sm text-gray-500">{groups.length} groups</Text>
          </View>
          {groups.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-md border border-gray-100">
              <View className="bg-green-100 rounded-full p-4 mb-4">
                <UsersIcon size={32} color="#10B981" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold mt-2">No groups yet</Text>
              <Text className="text-gray-500 text-sm mt-1 text-center">Create a group to start splitting expenses</Text>
              <TouchableOpacity
                onPress={() => router.push('/splitly/create-group')}
                className="mt-4 bg-green-600 px-6 py-3 rounded-xl shadow-md"
              >
                <Text className="text-white font-semibold">+ Create Group</Text>
              </TouchableOpacity>
            </View>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100"
                onPress={() => router.push(`/splitly/group/${group.id}`)}
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {group.name}
                    </Text>
                    <View className="flex-row items-center">
                      <UsersIcon size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {group.members.length} members
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`text-lg font-bold ${
                      group.yourBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {group.yourBalance >= 0 ? '+' : ''}{format(Math.abs(group.yourBalance))}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Total: {format(group.totalExpenses)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <Text className="text-gray-500 text-xs">
                    {group.members.join(', ')}
                  </Text>
                  <ArrowRightIcon size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Recent Activity</Text>
            <Text className="text-sm text-gray-500">{activity.length} items</Text>
          </View>
          {activity.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-md border border-gray-100">
              <View className="bg-amber-100 rounded-full p-4 mb-4">
                <DollarSignIcon size={32} color="#F59E0B" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold mt-2">No recent activity</Text>
              <Text className="text-gray-500 text-sm mt-1 text-center">Your recent expenses and payments will appear here</Text>
            </View>
          ) : (
            activity.map((item) => (
              <View key={item.id} className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {item.description}
                    </Text>
                    <View className="flex-row items-center">
                      <CalendarIcon size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {item.group} • {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`text-lg font-bold ${
                      item.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.type === 'expense' ? '-' : '+'}{format(item.amount)}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full mt-1 ${
                      item.type === 'expense' ? 'bg-red-50' : 'bg-green-50'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        item.type === 'expense' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {item.type}
                      </Text>
                    </View>
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
              className="flex-1 bg-blue-600 rounded-xl p-4 items-center shadow-md"
              onPress={() => router.push('/splitly/add-expense')}
            >
              <PlusIcon size={24} color="#FFFFFF" />
              <Text className="text-white font-semibold mt-2">Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-green-600 rounded-xl p-4 items-center shadow-md"
              onPress={() => router.push('/splitly/settle-up')}
            >
              <DollarSignIcon size={24} color="#FFFFFF" />
              <Text className="text-white font-semibold mt-2">Settle Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
