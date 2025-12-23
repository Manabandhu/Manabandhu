import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  selected = false,
  className = "",
}) => {
  const baseClasses = `rounded-2xl p-4 border-2 ${
    selected
      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  } ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={baseClasses}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={baseClasses}>{children}</View>;
};


