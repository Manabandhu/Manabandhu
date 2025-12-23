import React from "react";
import { Pressable, Text, ActivityIndicator, View, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export interface GluestackButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export const GluestackButton: React.FC<GluestackButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  className = "",
  accessibilityLabel,
  testID,
}) => {
  const baseStyle: ViewStyle = {
    minHeight: size === "sm" ? 40 : size === "md" ? 48 : 56,
    paddingHorizontal: size === "sm" ? 16 : size === "md" ? 24 : 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: isDisabled || isLoading ? 0.6 : 1,
  };

  const textStyle: TextStyle = {
    fontSize: size === "sm" ? 14 : size === "md" ? 16 : 18,
    fontWeight: "600",
    color: variant === "outline" || variant === "ghost" ? "#6366f1" : "#ffffff",
  };

  const disabled = isDisabled || isLoading;

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[baseStyle, fullWidth && { width: "100%" }]}
        className={className}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: isLoading }}
        testID={testID}
      >
        {!disabled ? (
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
        {isLoading ? (
          <ActivityIndicator color={disabled ? "#9ca3af" : "#ffffff"} />
        ) : (
          <Text style={[textStyle, disabled && { color: "#9ca3af" }]}>{children}</Text>
        )}
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          baseStyle,
          { backgroundColor: "#f59e0b" },
          fullWidth && { width: "100%" },
        ]}
        className={className}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        testID={testID}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </Pressable>
    );
  }

  if (variant === "outline") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
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
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        testID={testID}
      >
        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        baseStyle,
        { backgroundColor: "transparent" },
        fullWidth && { width: "100%" },
      ]}
      className={className}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator color="#6366f1" />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
};

