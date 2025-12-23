import React from "react";
import { View, Text } from "react-native";

export interface GluestackProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export const GluestackProgress: React.FC<GluestackProgressProps> = ({
  value,
  max = 100,
  showLabel = true,
  className = "",
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View className={`mb-6 ${className}`}>
      {showLabel && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {value} / {max}
          </Text>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-indigo-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};

