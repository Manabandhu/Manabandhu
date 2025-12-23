const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure for web compatibility
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "mjs", "cjs"],
  unstable_enablePackageExports: false,
};

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Add polyfill for web builds
if (process.env.EXPO_PLATFORM === "web") {
  config.serializer = {
    ...config.serializer,
    getPolyfills: () => [
      require.resolve("./lib/polyfills.js"),
    ],
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
