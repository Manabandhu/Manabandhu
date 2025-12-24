import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FontState {
  scale: number;
  setScale: (scale: number) => void;
  resetScale: () => void;
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      scale: 1.0,
      setScale: (scale: number) => set({ scale }),
      resetScale: () => set({ scale: 1.0 }),
    }),
    {
      name: 'font-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);