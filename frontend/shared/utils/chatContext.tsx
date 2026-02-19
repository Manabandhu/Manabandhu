import React from "react";
import { View, Text } from "react-native";
import { ChatContext } from "@/shared/api/chat";
import { HomeIcon, CarIcon, UsersIcon, UserIcon, MessageIcon } from "@/shared/components/ui/Icons";

export interface ChatContextTagProps {
  context?: ChatContext;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const getChatContextConfig = (context?: ChatContext) => {
  switch (context) {
    case 'ROOM':
      return {
        label: 'Room',
        backgroundColor: '#EFF6FF',
        textColor: '#1E40AF',
        darkBackgroundColor: '#1E3A8A',
        darkTextColor: '#93C5FD',
        icon: HomeIcon,
      };
    case 'RIDE':
      return {
        label: 'Ride',
        backgroundColor: '#F0FDF4',
        textColor: '#166534',
        darkBackgroundColor: '#14532D',
        darkTextColor: '#86EFAC',
        icon: CarIcon,
      };
    case 'COMMUNITY':
      return {
        label: 'Community',
        backgroundColor: '#FDF4FF',
        textColor: '#86198F',
        darkBackgroundColor: '#6B21A8',
        darkTextColor: '#E9D5FF',
        icon: UsersIcon,
      };
    case 'GROUP':
      return {
        label: 'Group',
        backgroundColor: '#FEF3C7',
        textColor: '#92400E',
        darkBackgroundColor: '#78350F',
        darkTextColor: '#FDE68A',
        icon: UsersIcon,
      };
    case 'PERSONAL':
      return {
        label: 'Personal',
        backgroundColor: '#F3F4F6',
        textColor: '#374151',
        darkBackgroundColor: '#1F2937',
        darkTextColor: '#D1D5DB',
        icon: UserIcon,
      };
    case 'ONE_ON_ONE':
      return {
        label: 'One-on-One',
        backgroundColor: '#FCE7F3',
        textColor: '#9F1239',
        darkBackgroundColor: '#831843',
        darkTextColor: '#FBCFE8',
        icon: MessageIcon,
      };
    default:
      return {
        label: 'Chat',
        backgroundColor: '#F3F4F6',
        textColor: '#6B7280',
        darkBackgroundColor: '#374151',
        darkTextColor: '#9CA3AF',
        icon: MessageIcon,
      };
  }
};

export const ChatContextTag: React.FC<ChatContextTagProps & { isDarkMode?: boolean }> = ({
  context,
  size = 'small',
  showIcon = true,
  isDarkMode = false,
}) => {
  const config = getChatContextConfig(context);
  const Icon = config.icon;

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 10,
      iconSize: 12,
    },
    medium: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      iconSize: 14,
    },
    large: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 14,
      iconSize: 16,
    },
  };

  const style = sizeStyles[size];

  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        backgroundColor: isDarkMode ? config.darkBackgroundColor : config.backgroundColor,
        paddingHorizontal: style.paddingHorizontal,
        paddingVertical: style.paddingVertical,
      }}
    >
      {showIcon && Icon && (
        <View className="mr-1">
          <Icon size={style.iconSize} color={isDarkMode ? config.darkTextColor : config.textColor} />
        </View>
      )}
      <Text
        className="font-semibold"
        style={{
          color: isDarkMode ? config.darkTextColor : config.textColor,
          fontSize: style.fontSize,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
};


