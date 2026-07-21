export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

const palette = {
  indigo: '#3D5AFE',
  indigoDark: '#7B8CFF',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  white: '#FFFFFF',
  success: '#69C779',
  warning: '#FFC107',
  danger: '#FE6301',
};

const lightColors = {
  background: palette.white,
  surface: palette.slate100,
  card: palette.white,
  text: palette.slate900,
  textMuted: palette.slate500,
  border: palette.slate200,
  primary: palette.indigo,
  onPrimary: palette.white,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  disabled: palette.slate300,
};

const darkColors = {
  background: palette.slate900,
  surface: palette.slate800,
  card: palette.slate800,
  text: palette.white,
  textMuted: palette.slate300,
  border: palette.slate700,
  primary: palette.indigoDark,
  onPrimary: palette.slate900,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  disabled: palette.slate700,
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const textSizeScale = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

export type TextSizeKey = keyof typeof textSizeScale;

export const accentSwatches = [
  { key: 'indigo', light: '#3D5AFE', dark: '#7B8CFF' },
  { key: 'blue', light: '#2563EB', dark: '#60A5FA' },
  { key: 'green', light: '#16A34A', dark: '#4ADE80' },
  { key: 'purple', light: '#9333EA', dark: '#C084FC' },
  { key: 'orange', light: '#EA580C', dark: '#FB923C' },
  { key: 'red', light: '#DC2626', dark: '#F87171' },
];

export const cardTintSwatches = [
  { key: 'default', light: palette.white, dark: palette.slate800 },
  { key: 'cool', light: '#F8FAFF', dark: '#111C2E' },
  { key: 'warm', light: '#FFFBF5', dark: '#231B12' },
  { key: 'mint', light: '#F3FBF6', dark: '#0F241A' },
];

interface ThemeOptions {
  accentColor?: string;
  cardTint?: string;
  textSize?: TextSizeKey;
}

export function buildTheme(dark: boolean, options: ThemeOptions = {}) {
  const baseColors = dark ? darkColors : lightColors;
  const scale = textSizeScale[options.textSize ?? 'medium'];

  const scaledTypography = {
    ...typography,
    fontSize: Object.fromEntries(
      Object.entries(typography.fontSize).map(([key, value]) => [key, Math.round(value * scale)])
    ) as typeof typography.fontSize,
  };

  const accentSwatch = accentSwatches.find((s) => s.key === options.accentColor);
  const cardSwatch = cardTintSwatches.find((s) => s.key === options.cardTint);

  return {
    dark,
    colors: {
      ...baseColors,
      primary: accentSwatch ? (dark ? accentSwatch.dark : accentSwatch.light) : baseColors.primary,
      card: cardSwatch ? (dark ? cardSwatch.dark : cardSwatch.light) : baseColors.card,
    },
    spacing,
    radius,
    typography: scaledTypography,
    shadow: dark ? shadows.dark : shadows.light,
  };
}

export type Theme = ReturnType<typeof buildTheme>;
