import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { DollarSignIcon, GlobeIcon, CalendarIcon, FileIcon, BellIcon, ShoppingBagIcon } from "@/components/ui/Icons";

interface UtilityItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export default function Utilities() {
  const utilities: UtilityItem[] = [
    {
      id: '1',
      title: 'Currency Exchange',
      description: 'Live USD to INR rates',
      icon: DollarSignIcon,
      action: () => Alert.alert('Currency Rates', 'Current USD to INR: ₹83.25\nLast updated: Just now')
    },
    {
      id: '2',
      title: 'USCIS Case Tracker',
      description: 'Track your visa application',
      icon: FileIcon,
      action: () => Linking.openURL('https://egov.uscis.gov/casestatus/landing.do')
    },
    {
      id: '3',
      title: 'Package Tracking',
      description: 'Track USPS, UPS, FedEx packages',
      icon: ShoppingBagIcon,
      action: () => Alert.alert('Package Tracking', 'Enter your tracking number to get real-time updates')
    },
    {
      id: '4',
      title: 'Flight Status',
      description: 'Check flight delays and updates',
      icon: GlobeIcon,
      action: () => Alert.alert('Flight Status', 'Enter flight number to check status')
    },
    {
      id: '5',
      title: 'Reminders',
      description: 'Set important reminders',
      icon: BellIcon,
      action: () => Alert.alert('Reminders', 'Visa renewal due in 30 days\nTax filing deadline: April 15')
    },
    {
      id: '6',
      title: 'Grocery List',
      description: 'Shared shopping lists',
      icon: CalendarIcon,
      action: () => Alert.alert('Grocery List', 'Milk\nBread\nEggs\nRice\nOnions')
    }
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Utilities
      </Text>
      <Text className="text-gray-600 mb-6">
        Helpful tools for daily life
      </Text>
      
      <View className="grid grid-cols-2 gap-4">
        {utilities.map((utility) => (
          <TouchableOpacity
            key={utility.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
            onPress={utility.action}
          >
            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                <utility.icon size={24} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
                {utility.title}
              </Text>
              <Text className="text-gray-600 text-sm text-center">
                {utility.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Stats */}
      <View className="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Quick Info
        </Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">USD to INR</Text>
            <Text className="text-gray-900 font-medium">₹83.25</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Gold (per oz)</Text>
            <Text className="text-gray-900 font-medium">$2,045</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Weather</Text>
            <Text className="text-gray-900 font-medium">72°F Sunny</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}




