import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { useFontStore } from '@/store/font.store';

const originalTextRender = Text.render;
const originalTextInputRender = TextInput.render;

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { scale } = useFontStore();

  useEffect(() => {
    // Override Text render method
    Text.render = function(props: any, ref: any) {
      const style = Array.isArray(props.style) ? props.style : [props.style];
      const flatStyle = style.reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
      const baseFontSize = flatStyle.fontSize || 16;
      
      const newProps = {
        ...props,
        style: [
          ...style,
          { fontSize: baseFontSize * scale }
        ]
      };
      
      return originalTextRender.call(this, newProps, ref);
    };

    // Override TextInput render method
    TextInput.render = function(props: any, ref: any) {
      const style = Array.isArray(props.style) ? props.style : [props.style];
      const flatStyle = style.reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
      const baseFontSize = flatStyle.fontSize || 16;
      
      const newProps = {
        ...props,
        style: [
          ...style,
          { fontSize: baseFontSize * scale }
        ]
      };
      
      return originalTextInputRender.call(this, newProps, ref);
    };

    return () => {
      Text.render = originalTextRender;
      TextInput.render = originalTextInputRender;
    };
  }, [scale]);

  return <>{children}</>;
};