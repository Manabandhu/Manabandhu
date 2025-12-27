import { Linking, Platform } from "react-native";

const googleMapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const appleMapsSearch = (query: string) =>
  `http://maps.apple.com/?q=${encodeURIComponent(query)}`;

export const openMapsSearch = async (query: string) => {
  const url = Platform.OS === "ios" ? appleMapsSearch(query) : googleMapsSearch(query);
  await Linking.openURL(url);
};

export const openMapsDirections = async (destination: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  await Linking.openURL(url);
};

// Open maps with origin and destination for directions
export const openMapsDirectionsWithOrigin = async (origin: string, destination: string) => {
  if (Platform.OS === "ios") {
    // Apple Maps format: origin and destination
    const url = `http://maps.apple.com/?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}`;
    await Linking.openURL(url);
  } else {
    // Google Maps format
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    await Linking.openURL(url);
  }
};

// Open maps with coordinates
export const openMapsDirectionsWithCoords = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
) => {
  if (Platform.OS === "ios") {
    // Apple Maps format with coordinates
    const url = `http://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}`;
    await Linking.openURL(url);
  } else {
    // Google Maps format with coordinates
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
    await Linking.openURL(url);
  }
};
