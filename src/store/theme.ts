import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'racing' | 'corporate' | 'modern' | 'enterprise' | 'marketplace' | 'minimal';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'marketplace',
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'marketplace') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'motorxpress-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === 'marketplace') {
            document.documentElement.removeAttribute('data-theme');
          } else {
            document.documentElement.setAttribute('data-theme', state.theme);
          }
        }
      }
    }
  )
);
