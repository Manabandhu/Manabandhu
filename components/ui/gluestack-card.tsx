import React from "react";
import { Pressable, View } from "react-native";

export interface GluestackCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const GluestackCard: React.FC<GluestackCardProps> = ({
  children,
  onPress,
  isSelected = false,
  className = "",
}) => {
  const baseClasses = `rounded-2xl p-4 border-2 ${
    isSelected
      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  } ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={baseClasses}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseClasses}>{children}</View>;
};

