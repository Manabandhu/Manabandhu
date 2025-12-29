import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SettingsIcon, UserIcon, FileIcon, ShieldIcon, AlertTriangleIcon, BanIcon } from "@/components/ui/Icons";

interface AdminItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  count?: number;
  action: () => void;
}

export default function AdminSafety() {
  const insets = useSafeAreaInsets();

  const adminItems: AdminItem[] = [
    {
      id: '1',
      title: 'Reported Content',
      description: 'Review and moderate reported posts',
      icon: AlertTriangleIcon,
      color: '#EF4444',
      count: 12,
      action: () => console.log('Reported Content')
    },
    {
      id: '2',
      title: 'User Reports',
      description: 'Manage user reports and complaints',
      icon: FileIcon,
      color: '#F59E0B',
      count: 5,
      action: () => console.log('User Reports')
    },
    {
      id: '3',
      title: 'Blocked Users',
      description: 'View and manage blocked users',
      icon: BanIcon,
      color: '#6B7280',
      count: 3,
      action: () => console.log('Blocked Users')
    },
    {
      id: '4',
      title: 'Terms & Privacy',
      description: 'Manage terms of service and privacy policy',
      icon: ShieldIcon,
      color: '#3B82F6',
      action: () => console.log('Terms & Privacy')
    },
    {
      id: '5',
      title: 'User Management',
      description: 'View and manage all users',
      icon: UserIcon,
      color: '#10B981',
      action: () => console.log('User Management')
    },
    {
      id: '6',
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: SettingsIcon,
      color: '#8B5CF6',
      action: () => console.log('System Settings')
    }
  ];

  const totalReports = adminItems
    .filter(item => item.count)
    .reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-1">
            <ShieldIcon size={28} color="#DC2626" />
            <Text className="text-3xl font-bold text-gray-900 ml-2">Admin & Safety</Text>
          </View>
          <Text className="text-sm text-gray-500 mt-1">Manage platform safety and moderation</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Summary Card */}
        <View className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 mb-6 border border-red-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Total Pending Reports</Text>
              <Text className="text-3xl font-bold text-red-600">{totalReports}</Text>
            </View>
            <View className="bg-red-100 rounded-full p-4">
              <AlertTriangleIcon size={32} color="#DC2626" />
            </View>
          </View>
        </View>

        {/* Admin Items Grid */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Management Tools</Text>
          <View className="flex-row flex-wrap justify-between">
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100"
                  style={{ width: '48%' }}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View className="items-start">
                    <View 
                      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon size={24} color={item.color} />
                    </View>
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {item.title}
                    </Text>
                    <Text className="text-gray-600 text-xs leading-4 mb-2">
                      {item.description}
                    </Text>
                    {item.count !== undefined && (
                      <View className={`px-2 py-1 rounded-full ${
                        item.count > 0 ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          item.count > 0 ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          {item.count} {item.count === 1 ? 'item' : 'items'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-md border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Stats</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Active Users</Text>
              <Text className="text-gray-900 font-semibold">1,234</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Total Posts</Text>
              <Text className="text-gray-900 font-semibold">5,678</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Platform Health</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-600 font-semibold">Good</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Warning Notice */}
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
          <View className="flex-row items-start">
            <AlertTriangleIcon size={20} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="text-amber-900 font-semibold mb-1">Admin Access</Text>
              <Text className="text-amber-800 text-sm leading-5">
                This section is restricted to administrators only. Use these tools responsibly 
                to maintain platform safety and user experience.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
