import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import themes from './themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[themeIndex];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
    root.setAttribute('data-theme', theme.id);
  }, [theme]);

  const nextTheme = useCallback(() => {
    setThemeIndex((i) => (i + 1) % themes.length);
  }, []);

  const prevTheme = useCallback(() => {
    setThemeIndex((i) => (i - 1 + themes.length) % themes.length);
  }, []);

  const setTheme = useCallback((id) => {
    const idx = themes.findIndex((t) => t.id === id);
    if (idx !== -1) setThemeIndex(idx);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, themeIndex, themes, nextTheme, prevTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
