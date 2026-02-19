import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useFontStore } from '@/store/font.store';

const OriginalText = RNText;

const ScaledText: React.FC<TextProps> = ({ style, ...props }) => {
  const { scale } = useFontStore();
  
  const scaledStyle = React.useMemo(() => {
    if (!style) return { fontSize: 16 * scale };
    
    const styleArray = Array.isArray(style) ? style : [style];
    const flatStyle = styleArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const baseFontSize = flatStyle.fontSize || 16;
    
    return [style, { fontSize: baseFontSize * scale }];
  }, [style, scale]);

  return <OriginalText {...props} style={scaledStyle} />;
};

// Override React Native's Text component globally
if (typeof global !== 'undefined') {
  (global as any).Text = ScaledText;
}

export { OriginalText as Text };