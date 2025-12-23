const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure for web compatibility
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "mjs", "cjs"],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ["browser", "require", "react-native"],
};

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  unstable_allowRequireContext: true,
};

// Web-specific configuration
if (process.env.EXPO_PUBLIC_PLATFORM === "web" || process.env.NODE_ENV === "development") {
  config.resolver.platforms = ["web", "native", "ios", "android"];
}

module.exports = withNativeWind(config, { input: "./global.css" });
