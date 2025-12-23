import React, { useState, memo, useCallback } from "react";
import { TextInput, Text, View, TextInputProps, StyleSheet, NativeSyntheticEvent, TextInputFocusEventData } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  floatingLabel?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Input: React.FC<InputProps> = memo(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = "",
  floatingLabel = false,
  value,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;
  const showLabel = floatingLabel ? true : !!label;

  const handleFocus = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <View
        className={`flex-row items-center border rounded-2xl px-4 h-[50px] bg-white dark:bg-gray-800 ${
          error
            ? "border-error-500"
            : isFocused
            ? "border-primary-600"
            : "border-gray-300 dark:border-gray-600"
        }`}
        style={styles.inputWrapper}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <View style={styles.inputContainer}>
          {floatingLabel && (
            <Text
              style={[
                styles.floatingLabel,
                (isFocused || hasValue) && styles.floatingLabelActive,
              ]}
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
            style={styles.input}
            accessibilityLabel={accessibilityLabel || label || props.placeholder}
            accessibilityHint={accessibilityHint || (error ? `Error: ${error}` : undefined)}
            accessibilityState={{ disabled: props.editable === false }}
            accessibilityRole="textbox"
            testID={testID}
            {...props}
          />
        </View>
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  floatingLabel: {
    position: "absolute",
    top: 15,
    left: 0,
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
    zIndex: 1,
    opacity: 0,
  },
  floatingLabelActive: {
    top: -8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    opacity: 1,
  },
  input: {
    padding: 0,
    margin: 0,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
});

