import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark' | 'amoled';
export type EffectiveScheme = 'light' | 'dark' | 'amoled';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  effectiveScheme: EffectiveScheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  effectiveScheme: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@ytube_theme').then((saved) => {
      if (saved) setThemeState(saved as ThemeMode);
      setLoaded(true);
    });
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('@ytube_theme', newTheme);
  };

  const effectiveScheme: EffectiveScheme =
    theme === 'amoled'
      ? 'amoled'
      : theme === 'light'
      ? 'light'
      : theme === 'dark'
      ? 'dark'
      : systemScheme === 'dark'
      ? 'dark'
      : 'light';

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
