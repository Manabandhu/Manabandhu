import React from "react";
import { View, Text } from "react-native";

interface ProgressProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  current,
  total,
  showLabel = true,
}) => {
  const percentage = (current / total) * 100;

  return (
    <View className="mb-6">
      {showLabel && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Step {current} of {total}
          </Text>
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};


