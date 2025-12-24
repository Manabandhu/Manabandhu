import { Stack } from 'expo-router';

export default function UscisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-case" />
      <Stack.Screen name="case/[id]" />
    </Stack>
  );
}