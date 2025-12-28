import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useThemeStore } from '@/store/theme.store';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  fullScreen = false,
}) => {
  const { isDarkMode } = useThemeStore();
  const containerStyle = fullScreen ? [styles.fullScreenContainer, { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }] : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, { color: isDarkMode ? '#D1D5DB' : COLORS.gray[600] }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});