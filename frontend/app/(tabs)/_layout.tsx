import { Tabs } from "expo-router";
import { Pressable, View, Modal, StyleSheet, Text, TouchableOpacity } from "react-native";
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
  PlusIcon
} from "@/components/ui/Icons";
import { useRouter } from "expo-router";

export default function TabsLayout() {
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const router = useRouter();

  const exploreOptions = [
    { icon: BriefcaseIcon, label: "Jobs", route: "/jobs" },
    { icon: RoomIcon, label: "Rooms", route: "/rooms" },
    { icon: CarIcon, label: "Rides", route: "/rides" },
    { icon: CreditCardIcon, label: "Expenses", route: "/expenses" },
    { icon: UsersIcon, label: "Community", route: "/community" },
    { icon: SettingsIcon, label: "Utilities", route: "/utilities" },
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
          name="chat/index" 
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
          name="community/index" 
          options={{
            title: "Community",
            tabBarIcon: ({ color, size }) => <UsersIcon size={size} color={color} />,
          }}
        />
        
        {/* Hide all nested routes from tab bar */}
        <Tabs.Screen name="jobs" options={{ href: null }} />
        <Tabs.Screen name="rooms" options={{ href: null }} />
        <Tabs.Screen name="rides" options={{ href: null }} />
        <Tabs.Screen name="expenses" options={{ href: null }} />
        <Tabs.Screen name="utilities" options={{ href: null }} />
        <Tabs.Screen name="admin" options={{ href: null }} />
        <Tabs.Screen name="chat/conversation" options={{ href: null }} />
        <Tabs.Screen name="community/create-post" options={{ href: null }} />
      </Tabs>

      <Modal
        visible={showExploreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExploreMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowExploreMenu(false)}
        >
          <View style={styles.exploreMenu}>
            <Text style={styles.exploreTitle}>Explore</Text>
            <View style={styles.exploreGrid}>
              {exploreOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exploreOption}
                  onPress={() => handleExploreOptionPress(option.route)}
                >
                  <View style={styles.exploreIconContainer}>
                    <option.icon size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.exploreLabel}>{option.label}</Text>
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
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.3)",
    elevation: 8,
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
    paddingBottom: 40,
    maxHeight: "70%",
  },
  exploreTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  exploreOption: {
    width: "30%",
    alignItems: "center",
    marginBottom: 16,
  },
  exploreIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  exploreLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
});
