import React, { memo } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button" | "link" | "none";
  testID?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  testID,
}) => {
  const baseStyle: ViewStyle = {
    minHeight: size === "sm" ? 40 : size === "md" ? 48 : 56,
    paddingHorizontal: size === "sm" ? 16 : size === "md" ? 24 : 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled || loading ? 0.6 : 1,
  };

  const textStyle: TextStyle = {
    fontSize: size === "sm" ? 14 : size === "md" ? 16 : 18,
    fontWeight: "600",
    color: variant === "outline" || variant === "ghost" ? "#6366f1" : "#ffffff",
  };

  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[baseStyle, fullWidth && { width: "100%" }]}
        className={className}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || (loading ? "Loading" : undefined)}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
      >
        {!isDisabled ? (
          <LinearGradient
            colors={["#6366f1", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 16,
            }}
          />
        ) : (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 16,
              backgroundColor: "#d1d5db",
            }}
          />
        )}
        {loading ? (
          <ActivityIndicator color={isDisabled ? "#9ca3af" : "#ffffff"} />
        ) : (
          <Text style={[textStyle, isDisabled && { color: "#9ca3af" }]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === "secondary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          baseStyle,
          { backgroundColor: "#f59e0b" },
          fullWidth && { width: "100%" },
        ]}
        className={className}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          baseStyle,
          {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: "#6366f1",
          },
          fullWidth && { width: "100%" },
        ]}
        className={className}
      >
        {loading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        baseStyle,
        { backgroundColor: "transparent" },
        fullWidth && { width: "100%" },
      ]}
      className={className}
    >
      {loading ? (
        <ActivityIndicator color="#6366f1" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

