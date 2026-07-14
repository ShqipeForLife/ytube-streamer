export type ColorTokens = {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  surface: string;
  surfaceSecondary: string;
};

const colors = {
  light: {
    text: '#0F0F0F',
    tint: '#FF0033',
    background: '#F8F8F8',
    foreground: '#0F0F0F',
    card: '#FFFFFF',
    cardForeground: '#0F0F0F',
    primary: '#FF0033',
    primaryForeground: '#FFFFFF',
    secondary: '#F0F0F0',
    secondaryForeground: '#1A1A1A',
    muted: '#F0F0F0',
    mutedForeground: '#7A7A7A',
    accent: '#FF0033',
    accentForeground: '#FFFFFF',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#E5E5E5',
    input: '#EBEBEB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F4F4',
  } as ColorTokens,
  dark: {
    text: '#FFFFFF',
    tint: '#FF0033',
    background: '#0F0F0F',
    foreground: '#FFFFFF',
    card: '#1C1C1C',
    cardForeground: '#FFFFFF',
    primary: '#FF0033',
    primaryForeground: '#FFFFFF',
    secondary: '#2A2A2A',
    secondaryForeground: '#E0E0E0',
    muted: '#2A2A2A',
    mutedForeground: '#888888',
    accent: '#FF0033',
    accentForeground: '#FFFFFF',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#2A2A2A',
    input: '#222222',
    surface: '#1C1C1C',
    surfaceSecondary: '#2A2A2A',
  } as ColorTokens,
  amoled: {
    text: '#FFFFFF',
    tint: '#FF0033',
    background: '#000000',
    foreground: '#FFFFFF',
    card: '#111111',
    cardForeground: '#FFFFFF',
    primary: '#FF0033',
    primaryForeground: '#FFFFFF',
    secondary: '#1A1A1A',
    secondaryForeground: '#E0E0E0',
    muted: '#1A1A1A',
    mutedForeground: '#888888',
    accent: '#FF0033',
    accentForeground: '#FFFFFF',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#1A1A1A',
    input: '#111111',
    surface: '#111111',
    surfaceSecondary: '#1A1A1A',
  } as ColorTokens,
  radius: 12,
};

export default colors;
