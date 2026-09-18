import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../utils/responsive';

export const useAppTheme = () => {
  const { theme, colorScheme, themeMode, setThemeMode, isDark } = useTheme();
  const responsive = useResponsive();
  return useMemo(
    () => ({
      theme,
      colors: theme,
      colorScheme,
      themeMode,
      setThemeMode,
      isDark,
      responsive,
    }),
    [theme, colorScheme, themeMode, isDark, responsive]
  );
};
