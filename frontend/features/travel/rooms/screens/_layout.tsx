import { Stack } from "expo-router";

export default function RoomsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="map" />
      <Stack.Screen name="review" />
    </Stack>
  );
}


