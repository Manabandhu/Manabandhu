import React from "react";
import { Pressable, View, Text } from "react-native";
import { CheckIcon } from "./Icons";

export interface GluestackCheckboxProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const GluestackCheckbox: React.FC<GluestackCheckboxProps> = ({
  isChecked,
  onChange,
  label,
  isInvalid = false,
  isDisabled = false,
  className = "",
}) => {
  return (
    <Pressable
      onPress={() => !isDisabled && onChange(!isChecked)}
      disabled={isDisabled}
      className={`flex-row items-start mb-4 ${className}`}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center ${
          isChecked
            ? "bg-indigo-600 border-indigo-600"
            : isInvalid
            ? "border-red-500"
            : "border-gray-400"
        }`}
      >
        {isChecked && <CheckIcon size={14} color="#ffffff" />}
      </View>
      {label && (
        <View className="ml-3 flex-1">
          {typeof label === "string" ? (
            <Text className="text-gray-700 dark:text-gray-300">{label}</Text>
          ) : (
            label
          )}
        </View>
      )}
    </Pressable>
  );
};

