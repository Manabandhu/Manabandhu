import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BellIcon, LockIcon, HelpIcon, FileIcon } from '@/components/ui/Icons';

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          icon: BellIcon,
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: null,
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: LockIcon,
          label: 'Privacy Settings',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpIcon,
          label: 'Help & Support',
          type: 'navigation',
          onPress: () => Alert.alert('Help', 'Contact us at support@manabandhu.com')
        },
        {
          icon: FileIcon,
          label: 'Terms of Service',
          type: 'navigation',
          onPress: () => Alert.alert('Terms', 'Terms of service will be displayed here.')
        },
        {
          icon: FileIcon,
          label: 'Privacy Policy',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy policy will be displayed here.')
        }
      ]
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 py-4">
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-6">
            <Text className="text-gray-500 font-medium text-sm uppercase tracking-wide px-4 mb-2">
              {group.title}
            </Text>
            <View className="bg-white mx-4 rounded-xl">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`flex-row items-center px-4 py-4 ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle'}
                >
                  {item.icon && (
                    <View className="w-8 h-8 items-center justify-center mr-3">
                      <item.icon size={20} color="#6B7280" />
                    </View>
                  )}
                  <Text className="flex-1 text-gray-900 font-medium">
                    {item.label}
                  </Text>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                    />
                  ) : (
                    <Text className="text-gray-400">›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-400 text-sm">ManaBandhu v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}