import React, { createContext, useContext, useMemo } from 'react';
import useStore from '@/store/useStore';
import { buildTheme, Theme } from './theme';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useStore((state) => state.config.darkMode);
  const accentColor = useStore((state) => state.config.accentColor);
  const cardTint = useStore((state) => state.config.cardTint);
  const textSize = useStore((state) => state.config.textSize);

  const theme = useMemo(
    () => buildTheme(darkMode, { accentColor, cardTint, textSize }),
    [darkMode, accentColor, cardTint, textSize]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
