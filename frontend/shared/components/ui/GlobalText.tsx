import React from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { useFontStore } from '@/store/font.store';

const OriginalText = RNText;

const ScaledText: React.FC<TextProps> = ({ style, ...props }) => {
  const { scale } = useFontStore();
  
  const scaledStyle = React.useMemo(() => {
    const flatStyle = (StyleSheet.flatten(style) ?? {}) as TextStyle;
    const baseFontSize = typeof flatStyle.fontSize === 'number' ? flatStyle.fontSize : 16;
    return [style, { fontSize: baseFontSize * scale }];
  }, [style, scale]);

  return <OriginalText {...props} style={scaledStyle} />;
};

// Override React Native's Text component globally
if (typeof global !== 'undefined') {
  (global as any).Text = ScaledText;
}

export { OriginalText as Text };
