module.exports = function (api) {
  api.cache(true);
  
  // Check if we're building for web using environment variables
  // Metro/Expo sets these when building for web platform
  const isWeb = 
    process.env.EXPO_PUBLIC_PLATFORM === "web" ||
    process.env.BABEL_ENV === "web";
  
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Apply import.meta transform for web builds
      // This transforms import.meta to CommonJS-compatible code
      // Safe to apply conditionally - only transforms if import.meta is found
      ...(isWeb ? [
        [
          "babel-plugin-transform-import-meta",
          {
            target: "CommonJS",
          },
        ],
        ["@babel/plugin-transform-modules-commonjs", { 
          strict: false,
          allowTopLevelThis: true,
          loose: true,
        }],
      ] : []),
      "react-native-reanimated/plugin",
    ],
  };
};
