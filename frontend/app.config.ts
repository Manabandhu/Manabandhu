import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "ManaBandhu",
  slug: "manabandhu",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#6366f1", // Primary color to match gradient
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.manabandhu.app",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.manabandhu.app",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || undefined,
      },
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
    template: "./web/index.html"
  },
  plugins: [
    "expo-router",
    "expo-asset",
    "expo-secure-store",
    [
      "expo-apple-authentication",
      {
        appleTeamId: process.env.EXPO_PUBLIC_APPLE_TEAM_ID || undefined,
      },
    ],
    "@react-native-google-signin/google-signin",
  ],
  scheme: "manabandhu",
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "your-project-id",
    },
  },
  experiments: {
    typedRoutes: true,
  },
});

