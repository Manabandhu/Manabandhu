import React from "react";
import { TextInput, Text, View, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = "",
  ...props
}) => {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 bg-white dark:bg-gray-800 ${
          error
            ? "border-error-500"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base text-gray-900 dark:text-gray-100"
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};

