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
