import { Stack } from 'expo-router';

export default function QaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ask" />
      <Stack.Screen name="question/[id]" />
    </Stack>
  );
}