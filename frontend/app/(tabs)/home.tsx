import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GluestackButton } from "@/shared/components/ui/gluestack-index";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { GRADIENTS } from "@/shared/constants/colors";
import { ROUTES } from "@/shared/constants/routes";
import * as Location from "expo-location";
import { checkLocationPermission, requestLocationPermission } from "@/lib/permissions";
import {
  MapPinIcon,
  BellIcon,
  SearchIcon,
  HomeIcon,
  BriefcaseIcon,
  CompassIcon,
  BusIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
  ChevronDownIcon,
  NavigationIcon,
  MessageIcon,
} from "@/shared/components/ui/Icons";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [location, setLocation] = useState("San Francisco, CA");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [search, setSearch] = useState("");
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temperature: number; description: string } | null>(null);
  const [currencyRates, setCurrencyRates] = useState<{ [key: string]: number } | null>(null);
  const [metals, setMetals] = useState<{ gold: number; silver: number } | null>(null);

  const weatherDescription = (code: number) => {
    const lookup: Record<number, string> = {
      0: "Clear",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Showers",
      82: "Heavy showers",
      95: "Thunderstorm",
    };
    return lookup[code] ?? "Weather update";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMarketData = async () => {
      setMarketLoading(true);
      setMarketError(null);
      try {
        const weatherUrl =
          "https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
        const currencyUrl =
          "https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,INR,NPR";
        const metalsUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/metals/spot`;

        const [weatherRes, currencyRes, metalsRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(currencyUrl),
          fetch(metalsUrl),
        ]);

        if (!weatherRes.ok || !currencyRes.ok || !metalsRes.ok) {
          throw new Error("Failed to fetch live data");
        }

        const weatherData = await weatherRes.json();
        const currencyData = await currencyRes.json();
        const metalsData = await metalsRes.json();

        if (isMounted) {
          setWeather({
            temperature: weatherData?.current?.temperature_2m,
            description: weatherDescription(weatherData?.current?.weather_code),
          });
          setCurrencyRates(currencyData?.rates ?? null);
          setMetals({
            gold: metalsData?.[0]?.gold,
            silver: metalsData?.[0]?.silver,
          });
        }
      } catch (error) {
        if (isMounted) {
          setMarketError("Unable to load live updates.");
        }
      } finally {
        if (isMounted) {
          setMarketLoading(false);
        }
      }
    };

    fetchMarketData();

    return () => {
      isMounted = false;
    };
  }, []);

  const featureCards = useMemo(
    () => [
      {
        label: "Jobs",
        description: "Trusted openings & referrals",
        icon: BriefcaseIcon,
        route: ROUTES.tabs.jobs,
        accent: "#F59E0B",
        background: "#FEF3C7",
      },
      {
        label: "Community",
        description: "Connect with your community",
        icon: UsersIcon,
        route: ROUTES.tabs.community,
        accent: "#10B981",
        background: "#D1FAE5",
      },
      {
        label: "Chat",
        description: "Message other users",
        icon: MessageIcon,
        route: ROUTES.tabs.chat,
        accent: "#2563EB",
        background: "#DBEAFE",
      },
      {
        label: "Immigration News",
        description: "Verified policy updates",
        icon: SearchIcon,
        route: "/immigration",
        accent: "#1D4ED8",
        background: "#DBEAFE",
      },
    ],
    []
  );

  const quickFilters = [
    { label: "Jobs", icon: BriefcaseIcon, route: ROUTES.tabs.jobs, color: "#F59E0B", background: "#FEF3C7" },
    { label: "Community", icon: UsersIcon, route: ROUTES.tabs.community, color: "#10B981", background: "#D1FAE5" },
    { label: "Chat", icon: MessageIcon, route: ROUTES.tabs.chat, color: "#2563EB", background: "#DBEAFE" },
  ];

  const nearbyUpdates = [
    { title: "Breaking: New H-1B policy announced", meta: "1 min ago • Immigration", tag: "Breaking" },
    { title: "Your I-485 case status updated", meta: "2 min ago • USCIS", tag: "Immigration" },
    { title: "2 verified room listings near you", meta: "5 min ago • Fremont", tag: "Housing" },
    { title: "Carpool to downtown leaves at 6 PM", meta: "Today • 1 seat left", tag: "Rides" },
    { title: "Weekend hiring event for students", meta: "Sat 10 AM • Free entry", tag: "Jobs" },
  ];

  const communityHighlights = [
    { title: "F-1 students: New OPT extension rules", meta: "Immigration • 30 min ago" },
    { title: "USCIS processing times updated", meta: "Immigration • 1h ago" },
    { title: "Visa bulletin updated for F1/F2", meta: "Immigration • 2h ago" },
    { title: "Best grocery deals this week", meta: "Deals • Crowdsourced" },
  ];

  const events = [
    { title: "Community meetup", meta: "Fri 6 PM • 1.2 mi away", tag: "Community" },
    { title: "Budgeting workshop", meta: "Thu 5 PM • Online", tag: "Money" },
  ];

  const supportActions = [
    {
      label: "SOS",
      description: "Call local helplines",
      color: "#FEE2E2",
      textColor: "#B91C1C",
      route: ROUTES.tabs.chat,
    },
    {
      label: "Report issue",
      description: "Flag scams or safety concerns",
      color: "#E0E7FF",
      textColor: "#3730A3",
      route: ROUTES.tabs.community,
    },
    {
      label: "Talk to support",
      description: "Chat with ManaBandhu",
      color: "#ECFDF3",
      textColor: "#166534",
      route: ROUTES.tabs.chat,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.auth.root);
  };

  const popularCities = [
    "San Francisco, CA",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Seattle, WA",
    "Boston, MA",
    "Austin, TX",
  ];

  const getCurrentLocation = async () => {
    try {
      // Check if permission is already granted
      const hasPermission = await checkLocationPermission();
      
      if (!hasPermission) {
        // Request permission
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission',
            'Location permission is needed to show nearby content. You can enable it later in settings.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const cityState = `${address.city || 'Unknown'}, ${address.region || 'Unknown'}`;
        setLocation(cityState);
        setShowLocationModal(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a city manually.',
        [{ text: 'OK' }]
      );
    }
  };

  // Request location permission on component mount
  useEffect(() => {
    const requestLocationOnMount = async () => {
      try {
        // Check if we already have permission
        const hasPermission = await checkLocationPermission();
        
        if (hasPermission) {
          // If we have permission, get location automatically
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address) {
            const cityState = `${address.city || 'Unknown'}, ${address.region || 'Unknown'}`;
            setLocation(cityState);
          }
        } else {
          // Request permission on first load
          const granted = await requestLocationPermission();
          
          if (granted) {
            // Get location if permission granted
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            
            const [address] = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            if (address) {
              const cityState = `${address.city || 'Unknown'}, ${address.region || 'Unknown'}`;
              setLocation(cityState);
            }
          } else {
            // Permission denied - show friendly message
            Alert.alert(
              'Location Access',
              'To show nearby content and personalized updates, please enable location access in your device settings.',
              [
                { text: 'Maybe Later', style: 'cancel' },
                { 
                  text: 'Open Settings', 
                  onPress: () => {
                    // On iOS, this will open app settings
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    }
                  }
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error requesting location on mount:', error);
        // Silently fail - user can still select location manually
      }
    };

    requestLocationOnMount();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB] dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <LinearGradient
          colors={GRADIENTS.primaryShort}
          className="mx-4 mt-2 rounded-3xl shadow-lg"
          style={{ paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-sm text-white/80">Hi, {user?.displayName || "Friend"}</Text>
              <Text className="text-2xl font-bold text-white mt-1 leading-7">
                Let's get you settled today
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-3">
                <TouchableOpacity 
                  className="flex-row items-center bg-white/15 rounded-full px-3 py-1.5"
                  onPress={() => setShowLocationModal(true)}
                >
                  <MapPinIcon size={14} color="#FFFFFF" />
                  <Text className="text-white text-xs font-semibold ml-2">
                    {location}
                  </Text>
                  <ChevronDownIcon size={12} color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <View className="flex-row items-center bg-white/10 rounded-full px-3 py-1.5">
                  <BellIcon size={14} color="#FFFFFF" />
                  <Text className="text-white text-xs ml-2">Alerts on</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 flex-row items-center shadow-sm">
            <SearchIcon size={16} color="#4F46E5" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search rooms, rides, jobs..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-sm text-gray-900 dark:text-white"
              returnKeyType="search"
            />
          </View>

          <View className="flex-row flex-wrap gap-2 mt-3">
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.label}
                  className="flex-row items-center rounded-full px-3 py-1.5"
                  style={{ backgroundColor: filter.background }}
                  activeOpacity={0.85}
                  onPress={() => router.push(filter.route)}
                >
                  <IconComponent size={14} color={filter.color} />
                  <Text className="ml-2 text-xs font-semibold" style={{ color: filter.color }}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* Location Modal */}
        <Modal
          visible={showLocationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Location</Text>
              
              <TouchableOpacity
                className="flex-row items-center bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4 mb-4"
                onPress={getCurrentLocation}
              >
                <MapPinIcon size={20} color="#4F46E5" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-blue-600 dark:text-blue-400">Use Current Location</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update location using GPS</Text>
                </View>
              </TouchableOpacity>

              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Or Select a City</Text>
              <ScrollView className="max-h-64">
                {popularCities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    className="py-3 border-b border-gray-100 dark:border-gray-700"
                    onPress={() => {
                      setLocation(city);
                      setShowLocationModal(false);
                    }}
                  >
                    <Text className="text-base text-gray-900 dark:text-white">{city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-2xl py-3"
                onPress={() => setShowLocationModal(false)}
              >
                <Text className="text-center text-base font-semibold text-gray-600 dark:text-gray-300">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="px-4 mt-6 gap-5">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Live updates</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Open source feeds</Text>
            </View>
            {marketLoading ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400">Loading live data...</Text>
            ) : marketError ? (
              <Text className="text-sm text-red-500 dark:text-red-400">{marketError}</Text>
            ) : (
              <View className="gap-4">
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-600">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Weather • San Francisco</Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                    {weather?.temperature != null ? `${Math.round(weather.temperature)}°F` : "--"}
                    {"  "}
                    <Text className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      {weather?.description ?? "—"}
                    </Text>
                  </Text>
                </View>
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-600">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Currency (USD)</Text>
                  <View className="flex-row flex-wrap gap-3 mt-2">
                    {currencyRates ? (
                      Object.entries(currencyRates).map(([code, rate]) => (
                        <View key={code} className="bg-white dark:bg-gray-600 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-500">
                          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {code} {rate.toFixed(2)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-500 dark:text-gray-400">--</Text>
                    )}
                  </View>
                </View>
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-600">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">Metals (USD/oz)</Text>
                  <Text className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    Gold: {metals?.gold != null ? `$${metals.gold.toFixed(2)}` : "--"}
                    {"  "}•{"  "}
                    Silver: {metals?.silver != null ? `$${metals.silver.toFixed(2)}` : "--"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Explore ManaBandhu</Text>
              <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Personalized</Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-3">
              {featureCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <TouchableOpacity
                    key={card.label}
                    className="w-[48%] rounded-2xl p-4"
                    style={{ backgroundColor: card.background }}
                    activeOpacity={0.85}
                    onPress={() => router.push(card.route)}
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" }}>
                      <IconComponent size={22} color={card.accent} />
                    </View>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {card.label}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-5">
                      {card.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Updates near you</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Refreshed hourly</Text>
            </View>
            <View className="gap-3">
              {nearbyUpdates.map((item) => (
                <View
                  key={item.title}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-3 border border-gray-100 dark:border-gray-600"
                >
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">{item.meta}</Text>
                    <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.tag}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Community highlights</Text>
              <UsersIcon size={18} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            </View>
            <View className="gap-3">
              {communityHighlights.map((item) => (
                <View key={item.title} className="flex-row justify-between items-center">
                  <View className="flex-1 pr-4">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.meta}</Text>
                  </View>
                  <TouchableOpacity
                    className="px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700"
                    activeOpacity={0.8}
                    onPress={() => router.push(ROUTES.tabs.community)}
                  >
                    <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Community calendar</Text>
              <CalendarIcon size={18} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
            </View>
            <View className="gap-3">
              {events.map((event) => (
                <View
                  key={event.title}
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-3 border border-gray-100 dark:border-gray-600"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">{event.meta}</Text>
                  </View>
                  <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {event.tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Safety & support</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Always visible</Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-3">
              {supportActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  className="w-[48%] rounded-2xl p-4"
                  style={{ backgroundColor: action.color }}
                  activeOpacity={0.85}
                  onPress={() => router.push(action.route)}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: action.textColor }}
                  >
                    {action.label}
                  </Text>
                  <Text
                    className="text-sm mt-2 leading-5"
                    style={{ color: action.textColor + "CC" }}
                  >
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GluestackButton
            onPress={handleSignOut}
            variant="outline"
            fullWidth
          >
            Sign Out
          </GluestackButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
