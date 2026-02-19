import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon, BellIcon, UserIcon } from "./Icons";
import * as Haptics from "expo-haptics";
import { ROUTES } from "@/shared/constants/routes";
import { useThemeStore } from "@/store/theme.store";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function Header({ title, showBack = true, onBackPress }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();

  // Get module name from pathname if title is not provided
  const getModuleName = () => {
    if (title) return title;

    // Extract module name from pathname
    const path = pathname || "";
    
    // Remove leading slash and split
    const parts = path.split("/").filter(Boolean);
    
    // Get the last meaningful part
    const module = parts[parts.length - 1] || "Home";
    
    // Capitalize and format
    return module
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const moduleName = getModuleName();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBackPress) {
      onBackPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push(ROUTES.tabs.home);
      }
    }
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.tabs.profile);
  };

  const handleNotificationsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to notifications - you can create a notifications screen later
    // For now, we'll just show an alert or navigate to a placeholder
    // router.push("/notifications");
  };

  return (
    <View style={[
      styles.header, 
      isDarkMode && styles.headerDark,
      { paddingTop: Math.max(insets.top, 6) }
    ]}>
      <View style={styles.headerContent}>
        {/* Left: Back Button */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <ArrowLeftIcon size={24} color={isDarkMode ? "#F9FAFB" : "#111827"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Module Name */}
        <View style={styles.centerSection}>
          <Text style={[styles.moduleName, { color: isDarkMode ? "#F9FAFB" : "#111827" }]} numberOfLines={1}>
            {moduleName}
          </Text>
        </View>

        {/* Right: Profile and Notifications */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={handleNotificationsPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <BellIcon size={22} color={isDarkMode ? "#D1D5DB" : "#374151"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <UserIcon size={22} color={isDarkMode ? "#D1D5DB" : "#374151"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  headerDark: {
    backgroundColor: "#111827",
    borderBottomColor: "#374151",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 36,
  },
  leftSection: {
    width: 44,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 88,
    justifyContent: "flex-end",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
});

