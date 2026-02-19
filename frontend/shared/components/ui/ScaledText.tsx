import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useScaledFont } from '@/lib/useScaledFont';

interface ScaledTextProps extends TextProps {
  fontSize?: number;
}

export const ScaledText: React.FC<ScaledTextProps> = ({ 
  fontSize = 16, 
  style, 
  ...props 
}) => {
  const { scaleFont } = useScaledFont();
  
  return (
    <RNText
      {...props}
      style={[
        { fontSize: scaleFont(fontSize) },
        style
      ]}
    />
  );
};