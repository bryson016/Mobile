export const lightTheme = {
  primary: '#B6FF2E',
  primaryLight: '#E8FFB6',
  primaryDark: '#8FCE00',
  secondary: '#23262F',
  accent: '#23262F',
  danger: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  text: '#23262F',
  textSecondary: '#64748B',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  chipBg: '#F1F5F9',
  white: '#FFFFFF',
  black: '#23262F',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#23262F',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
  card: '#FFFFFF',
};

export const darkTheme = {
  primary: '#B6FF2E',
  primaryLight: '#E8FFB6',
  primaryDark: '#8FCE00',
  secondary: '#23262F',
  accent: '#B6FF2E',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  success: '#34D399',
  background: '#23262F',
  surface: '#2E323D',
  surfaceAlt: '#3D424E',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#3D424E',
  borderLight: '#475569',
  chipBg: '#3D424E',
  white: '#FFFFFF',
  black: '#23262F',
  gray: '#94A3B8',
  lightGray: '#2E323D',
  darkGray: '#23262F',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.6)',
  card: '#2E323D',
};

export type Theme = typeof lightTheme;

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export default {
  ...lightTheme,
  darkTheme,
  lightTheme,
};