import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/store/theme.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDarkMode } = useThemeStore();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    // Set NativeWind color scheme
    setColorScheme(isDarkMode ? 'dark' : 'light');
    
    // Apply dark class to document for web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, setColorScheme]);

  // For native, NativeWind will use the colorScheme from useColorScheme hook
  // The dark class needs to be on a parent element for dark: variants to work
  return (
    <View className={isDarkMode ? 'dark' : ''} style={{ flex: 1 }}>
      {children}
    </View>
  );
}

