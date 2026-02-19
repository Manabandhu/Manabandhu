import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DollarSignIcon, GlobeIcon, CalendarIcon, FileIcon, BellIcon, ShoppingBagIcon, SettingsIcon } from "@/shared/components/ui/Icons";

interface UtilityItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

export default function Utilities() {
  const insets = useSafeAreaInsets();
  
  const utilities: UtilityItem[] = [
    {
      id: '1',
      title: 'Currency Exchange',
      description: 'Live USD to INR rates',
      icon: DollarSignIcon,
      color: '#10B981',
      action: () => Alert.alert('Currency Rates', 'Current USD to INR: ₹83.25\nLast updated: Just now')
    },
    {
      id: '2',
      title: 'USCIS Case Tracker',
      description: 'Track your visa application',
      icon: FileIcon,
      color: '#3B82F6',
      action: () => Linking.openURL('https://egov.uscis.gov/casestatus/landing.do')
    },
    {
      id: '3',
      title: 'Package Tracking',
      description: 'Track USPS, UPS, FedEx packages',
      icon: ShoppingBagIcon,
      color: '#F59E0B',
      action: () => Alert.alert('Package Tracking', 'Enter your tracking number to get real-time updates')
    },
    {
      id: '4',
      title: 'Flight Status',
      description: 'Check flight delays and updates',
      icon: GlobeIcon,
      color: '#8B5CF6',
      action: () => Alert.alert('Flight Status', 'Enter flight number to check status')
    },
    {
      id: '5',
      title: 'Reminders',
      description: 'Set important reminders',
      icon: BellIcon,
      color: '#EF4444',
      action: () => Alert.alert('Reminders', 'Visa renewal due in 30 days\nTax filing deadline: April 15')
    },
    {
      id: '6',
      title: 'Grocery List',
      description: 'Shared shopping lists',
      icon: CalendarIcon,
      color: '#EC4899',
      action: () => Alert.alert('Grocery List', 'Milk\nBread\nEggs\nRice\nOnions')
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 shadow-sm">
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            Utilities
          </Text>
          <Text className="text-sm text-gray-500">
            Helpful tools for daily life
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Utilities Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {utilities.map((utility) => {
            const Icon = utility.icon;
            return (
              <TouchableOpacity
                key={utility.id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-100"
                style={{ width: '48%' }}
                onPress={utility.action}
                activeOpacity={0.7}
              >
                <View className="items-center">
                  <View 
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: `${utility.color}15` }}
                  >
                    <Icon size={28} color={utility.color} />
                  </View>
                  <Text className="text-base font-bold text-gray-900 text-center mb-1">
                    {utility.title}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    {utility.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Stats */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-md border border-gray-100">
          <View className="flex-row items-center mb-4">
            <SettingsIcon size={20} color="#6B7280" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Quick Info</Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <View className="flex-row items-center">
                <DollarSignIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">USD to INR</Text>
              </View>
              <Text className="text-gray-900 font-semibold">₹83.25</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <View className="flex-row items-center">
                <DollarSignIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">Gold (per oz)</Text>
              </View>
              <Text className="text-gray-900 font-semibold">$2,045</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-row items-center">
                <GlobeIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">Weather</Text>
              </View>
              <Text className="text-gray-900 font-semibold">72°F Sunny</Text>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-8 border border-blue-100">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            💡 Pro Tip
          </Text>
          <Text className="text-sm text-gray-600 leading-5">
            Use these utilities to stay organized and track important information. 
            Bookmark frequently used tools for quick access.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
