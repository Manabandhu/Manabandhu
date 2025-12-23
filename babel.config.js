module.exports = function (api) {
  api.cache(true);
  const isWeb = api.caller((caller) => caller?.platform === "web");
  
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ...(isWeb ? [
        "babel-plugin-transform-import-meta",
        ["@babel/plugin-transform-modules-commonjs", { 
          strict: false,
          allowTopLevelThis: true,
        }],
      ] : []),
      "react-native-reanimated/plugin",
    ],
  };
};
