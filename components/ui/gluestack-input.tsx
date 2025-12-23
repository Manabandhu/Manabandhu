import React, { useState, useCallback } from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

export interface GluestackInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  floatingLabel?: boolean;
}

export const GluestackInput: React.FC<GluestackInputProps> = ({
  label,
  error,
  leftElement,
  rightElement,
  containerClassName = "",
  floatingLabel = false,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <View
        className={`flex-row items-center border rounded-2xl px-4 h-[50px] bg-white dark:bg-gray-800 ${
          error
            ? "border-red-500"
            : isFocused
            ? "border-indigo-600"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {leftElement && <View className="mr-3">{leftElement}</View>}
        <View className="flex-1 justify-center">
          {floatingLabel && label && (
            <Text
              className={`absolute left-0 ${
                isFocused || hasValue
                  ? "top-[-8px] text-xs bg-white px-1 text-indigo-600"
                  : "top-[15px] text-lg text-gray-500 opacity-0"
              }`}
            >
              {label}
            </Text>
          )}
          <TextInput
            className="flex-1 text-lg text-gray-900 dark:text-gray-100"
            placeholder={floatingLabel && (isFocused || hasValue) ? "" : props.placeholder}
            placeholderTextColor="#6B7280"
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ padding: 0, margin: 0 }}
            {...props}
          />
        </View>
        {rightElement && <View className="ml-3">{rightElement}</View>}
      </View>
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
      {!error && label && !floatingLabel && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</Text>
      )}
    </View>
  );
};

