import { Stack } from 'expo-router';

export default function ImmigrationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="article/[id]" />
    </Stack>
  );
}