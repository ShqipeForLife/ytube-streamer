import colors, { ColorTokens } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export function useColors(): ColorTokens & { radius: number } {
  const { effectiveScheme } = useTheme();
  const palette =
    effectiveScheme === 'amoled'
      ? colors.amoled
      : effectiveScheme === 'dark'
      ? colors.dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
