import { Tabs } from "expo-router";
import { COLORS } from "@/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="rooms" />
      <Tabs.Screen name="rides" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="utilities" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="admin" />
    </Tabs>
  );
}

