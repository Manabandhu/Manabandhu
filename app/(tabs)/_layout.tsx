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
    </Tabs>
  );
}

