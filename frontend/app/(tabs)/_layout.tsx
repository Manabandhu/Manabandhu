import { Tabs } from "expo-router";
import { Pressable, View, Modal, StyleSheet, Text, TouchableOpacity, Dimensions, Platform } from "react-native";
import { useState } from "react";
import { COLORS } from "@/constants/colors";
import { 
  HomeIcon, 
  SearchIcon, 
  MessageIcon, 
  UserIcon,
  BriefcaseIcon,
  HomeIcon as RoomIcon,
  CarIcon,
  CreditCardIcon,
  UsersIcon,
  SettingsIcon,
  PlusIcon,
  SplitIcon,
  XIcon
} from "@/components/ui/Icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/theme.store";

const { width } = Dimensions.get('window');

export default function TabsLayout() {
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();

  const exploreOptions = [
    { icon: BriefcaseIcon, label: "Jobs", route: "/jobs", color: "#3B82F6" },
    { icon: RoomIcon, label: "Rooms", route: "/rooms", color: "#10B981" },
    { icon: CarIcon, label: "Rides", route: "/rides", color: "#F59E0B" },
    { icon: CreditCardIcon, label: "Expenses", route: "/expenses", color: "#EF4444" },
    { icon: SplitIcon, label: "Splitly", route: "/splitly", color: "#8B5CF6" },
    { icon: SearchIcon, label: "Q&A", route: "/qa", color: "#059669" },
    { icon: SearchIcon, label: "USCIS", route: "/uscis", color: "#059669" },
    { icon: SearchIcon, label: "Immigration News", route: "/immigration", color: "#1D4ED8" },
    { icon: SettingsIcon, label: "Utilities", route: "/utilities", color: "#6B7280" },
    { icon: UserIcon, label: "Admin", route: "/admin", color: "#DC2626" },
  ];

  const handleExploreOptionPress = (route: string) => {
    setShowExploreMenu(false);
    router.push(route as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray[400],
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
            borderTopColor: isDarkMode ? "#374151" : "#E5E7EB",
          },
        }}
      >
        <Tabs.Screen 
          name="home" 
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
          }}
        />
        
        <Tabs.Screen 
          name="chat" 
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => <MessageIcon size={size} color={color} />,
          }}
        />
        
        <Tabs.Screen 
          name="explore" 
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.exploreButton}>
                <PlusIcon size={28} color="#FFFFFF" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowExploreMenu(true);
            },
          }}
        />
        
        <Tabs.Screen 
          name="community" 
          options={{
            title: "Community",
            tabBarIcon: ({ color, size }) => <UsersIcon size={size} color={color} />,
          }}
        />
        
        <Tabs.Screen 
          name="profile" 
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
          }}
        />
        

      </Tabs>

      <Modal
        visible={showExploreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExploreMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowExploreMenu(false)}
        >
          <View style={[
            styles.exploreMenu, 
            isDarkMode && styles.exploreMenuDark,
            { paddingBottom: insets.bottom + 20 }
          ]}>
            <View style={styles.exploreHeader}>
              <Text style={[styles.exploreTitle, isDarkMode && styles.exploreTitleDark]}>Explore Services</Text>
              <TouchableOpacity 
                onPress={() => setShowExploreMenu(false)}
                style={[styles.closeButton, isDarkMode && styles.closeButtonDark]}
              >
                <XIcon size={24} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.exploreGrid}>
              {exploreOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exploreOption}
                  onPress={() => handleExploreOptionPress(option.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.exploreIconContainer, { backgroundColor: option.color + '15' }]}>
                    <option.icon size={28} color={option.color} />
                  </View>
                  <Text style={[styles.exploreLabel, isDarkMode && styles.exploreLabelDark]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  exploreButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  exploreMenu: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: "80%",
  },
  exploreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  exploreTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  exploreTitleDark: {
    color: "#F9FAFB",
  },
  exploreMenuDark: {
    backgroundColor: "#111827",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  closeButtonDark: {
    backgroundColor: "#374151",
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  exploreOption: {
    width: (width - 80) / 3,
    alignItems: "center",
    marginBottom: 24,
  },
  exploreIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  exploreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  exploreLabelDark: {
    color: "#D1D5DB",
  },
});
