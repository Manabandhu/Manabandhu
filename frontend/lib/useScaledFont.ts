import { useFontStore } from '@/store/font.store';

export const useScaledFont = () => {
  const { scale } = useFontStore();
  
  const scaleFont = (baseSize: number) => baseSize * scale;
  
  return { scale, scaleFont };
};