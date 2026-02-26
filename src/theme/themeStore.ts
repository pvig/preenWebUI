import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { darkTheme, lightTheme, type Theme } from './theme';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: darkTheme,
      isDark: true,
      
      toggleTheme: () => set((state) => ({
        isDark: !state.isDark,
        theme: state.isDark ? lightTheme : darkTheme,
      })),
      
      setTheme: (isDark: boolean) => set({
        isDark,
        theme: isDark ? darkTheme : lightTheme,
      }),
    }),
    {
      name: 'preenfm3-theme',
      partialize: (state) => ({ isDark: state.isDark }),
      onRehydrateStorage: () => (state) => {
        // Synchroniser le theme avec isDark après chargement du localStorage
        if (state) {
          state.theme = state.isDark ? darkTheme : lightTheme;
        }
      },
    }
  )
);
