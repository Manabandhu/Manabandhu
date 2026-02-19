import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { BellIcon, LockIcon, HelpIcon, FileIcon, TypeIcon } from '@/shared/components/ui/Icons';
import { useFontStore } from '@/store/font.store';
import { useThemeStore } from '@/store/theme.store';
import { useScaledFont } from '@/lib/useScaledFont';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/shared/api/users';
import { getAvailableCurrencies, getCurrencySymbol, useCurrency } from '@/lib/currency';
import { auth } from '@/lib/firebase';
import { registerForPushNotifications, unregisterPushToken, getPushToken, getNotificationPermissions } from '@/lib/notifications';

type SettingsItem = 
  | { icon: React.ComponentType<any> | null; label: string; type: 'toggle'; value: boolean; onToggle: (value: boolean) => void }
  | { icon: React.ComponentType<any> | null; label: string; type: 'font-slider'; value: number; percentage: number }
  | { icon: React.ComponentType<any> | null; label: string; type: 'navigation'; value?: string; onPress: () => void };

type SettingsGroup = {
  title: string;
  items: SettingsItem[];
};

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, setDarkMode } = useThemeStore();
  const { scale, setScale, resetScale } = useFontStore();
  const { scaleFont } = useScaledFont();
  const { user, updateUserProfile } = useAuthStore();
  const { currency: currentCurrency } = useCurrency();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const availableCurrencies = getAvailableCurrencies();

  const fontPercentage = Math.round((scale - 1) * 100);

  // Check notification permissions on mount
  useEffect(() => {
    const checkNotifications = async () => {
      const permissions = await getNotificationPermissions();
      setNotifications(permissions.status === 'granted');
    };
    checkNotifications();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    try {
      if (value) {
        // Request permissions and register
        const token = await registerForPushNotifications();
        if (token) {
          setNotifications(true);
          Alert.alert('Success', 'Push notifications enabled');
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
          setNotifications(false);
        }
      } else {
        // Unregister token
        const token = await getPushToken();
        if (token) {
          await unregisterPushToken(token);
        }
        setNotifications(false);
        Alert.alert('Notifications Disabled', 'Push notifications have been disabled');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user || !auth) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    setSavingCurrency(true);
    try {
      
      await userApi.updateCurrentUser({
        firebaseUid: currentUser.uid,
        name: user.displayName || user.email || 'User',
        currency: newCurrency,
      });
      await updateUserProfile({ currency: newCurrency });
      setShowCurrencyModal(false);
      Alert.alert('Success', 'Currency preference updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency preference');
    } finally {
      setSavingCurrency(false);
    }
  };

  const settingsGroups: SettingsGroup[] = [
    {
      title: 'Notifications',
      items: [
        {
          icon: BellIcon,
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: handleNotificationToggle
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
          value: isDarkMode,
          onToggle: setDarkMode
        },
        {
          icon: TypeIcon,
          label: 'Font Size',
          type: 'font-slider',
          value: scale,
          percentage: fontPercentage
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: null,
          label: 'Currency',
          type: 'navigation',
          value: currentCurrency,
          onPress: () => setShowCurrencyModal(true)
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 dark:text-blue-400 text-lg" style={{ fontSize: scaleFont(18) }}>←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1" style={{ fontSize: scaleFont(18) }}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 py-4">
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide px-4 mb-2" style={{ fontSize: scaleFont(12) }}>
              {group.title}
            </Text>
            <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`px-4 py-4 ${
                    itemIndex !== group.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                  onPress={item.type === 'navigation' ? item.onPress : undefined}
                  disabled={item.type === 'toggle' || item.type === 'font-slider'}
                >
                  {item.type === 'font-slider' ? (
                    <View className="w-full">
                      <View className="flex-row items-center mb-3">
                        {item.icon && (
                          <View className="w-8 h-8 items-center justify-center mr-3">
                            <item.icon size={20} color="#6B7280" />
                          </View>
                        )}
                        <Text className="flex-1 text-gray-900 dark:text-white font-medium" style={{ fontSize: scaleFont(16) }}>
                          {item.label}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm" style={{ fontSize: scaleFont(14) }}>
                          {item.percentage > 0 ? `+${item.percentage}%` : item.percentage === 0 ? 'Default' : `${item.percentage}%`}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mr-2" style={{ fontSize: scaleFont(12) }}>A</Text>
                        <Slider
                          style={{ flex: 1, height: 40 }}
                          minimumValue={0.8}
                          maximumValue={1.5}
                          value={scale}
                          onValueChange={setScale}
                          minimumTrackTintColor="#3B82F6"
                          maximumTrackTintColor={isDarkMode ? "#374151" : "#E5E7EB"}
                          step={0.1}
                        />
                        <Text className="text-lg text-gray-400 dark:text-gray-500 ml-2" style={{ fontSize: scaleFont(18) }}>A</Text>
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <TouchableOpacity
                          onPress={resetScale}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                        >
                          <Text className="text-gray-600 dark:text-gray-300 text-xs font-medium" style={{ fontSize: scaleFont(12) }}>Reset</Text>
                        </TouchableOpacity>
                        <Text className="text-xs text-gray-400 dark:text-gray-500" style={{ fontSize: scaleFont(12) }}>80% - 150%</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      {item.icon && (
                        <View className="w-8 h-8 items-center justify-center mr-3">
                          <item.icon size={20} color="#6B7280" />
                        </View>
                      )}
                      <Text className="flex-1 text-gray-900 dark:text-white font-medium" style={{ fontSize: scaleFont(16) }}>
                        {item.label}
                      </Text>
                      {item.type === 'toggle' ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                          thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                        />
                      ) : item.type === 'navigation' && item.value ? (
                        <View className="flex-row items-center">
                          <Text className="text-gray-500 dark:text-gray-400 text-sm mr-2" style={{ fontSize: scaleFont(14) }}>
                            {getCurrencySymbol(item.value)} {item.value}
                          </Text>
                          <Text className="text-gray-400 dark:text-gray-500" style={{ fontSize: scaleFont(18) }}>›</Text>
                        </View>
                      ) : (
                        <Text className="text-gray-400 dark:text-gray-500" style={{ fontSize: scaleFont(18) }}>›</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-gray-400 dark:text-gray-500 text-sm" style={{ fontSize: scaleFont(14) }}>ManaBandhu v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontSize: scaleFont(20) }}>
                Select Currency
              </Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text className="text-blue-600 dark:text-blue-400 text-lg" style={{ fontSize: scaleFont(18) }}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {availableCurrencies.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  onPress={() => handleCurrencyChange(curr.code)}
                  disabled={savingCurrency}
                  className={`p-4 rounded-xl mb-2 ${
                    currentCurrency === curr.code 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400' 
                      : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white" style={{ fontSize: scaleFont(16) }}>
                        {curr.name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" style={{ fontSize: scaleFont(14) }}>
                        {curr.code}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-gray-700 dark:text-gray-300 mr-2" style={{ fontSize: scaleFont(18) }}>
                        {curr.symbol}
                      </Text>
                      {currentCurrency === curr.code && (
                        <View className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}