// design tokens — colors, fonts, spacing
export const COLORS = {
  surface: 'rgba(15, 15, 28, 0.96)',
  surfaceLight: 'rgba(15, 15, 25, 0.92)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  surfaceActive: 'rgba(59, 130, 246, 0.12)',

  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.1)',
  borderAccent: 'rgba(59, 130, 246, 0.2)',

  text: '#e0e0f0',
  textSecondary: '#c0c0d0',
  textMuted: '#888',
  textWhite: '#ffffff',

  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentDark: '#2563eb',

  trafficDownload: '#60a5fa',
  trafficUpload: '#34d399',
  trafficCapacity: '#f59e0b',

  danger: '#f24955',
  dangerBg: 'rgba(242, 73, 85, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.08)',
  warningBorder: 'rgba(245, 158, 11, 0.2)',

  green: '#4ade80',
  orange: '#fb923c',
  red: '#ef4444',
} as const;

export const BLUR = 'blur(12px)';

export const SHADOW = {
  dropdown: '0 8px 32px rgba(0, 0, 0, 0.6)',
  tooltip: '0 8px 28px rgba(0, 0, 0, 0.5)',
  card: '0 4px 20px rgba(0, 0, 0, 0.4)',
} as const;

export const RADIUS = {
  small: 5,
  medium: 8,
  large: 10,
  pill: 20,
} as const;

export const FONT = {
  xs: 8,
  sm: 9,
  body: 11,
  label: 12,
  md: 13,
  lg: 14,
  xl: 22,
} as const;

export const SECTION_HEADER = {
  fontSize: FONT.lg,
  fontWeight: 700,
  color: COLORS.text,
  margin: '16px 0 8px',
  borderBottom: `1px solid ${COLORS.border}`,
  paddingBottom: 8,
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: 8,
};

export const tooltipBox = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.surfaceHover}`,
  borderRadius: RADIUS.medium,
  padding: '10px 14px',
  fontSize: FONT.body,
  color: COLORS.textSecondary,
  backdropFilter: BLUR,
  boxShadow: SHADOW.tooltip,
  minWidth: 200,
};

export const tooltipTitle = {
  fontSize: FONT.md,
  fontWeight: 700,
  color: COLORS.textWhite,
  marginBottom: 4,
};

export const tooltipDivider = {
  height: 1,
  background: COLORS.border,
  margin: '5px 0',
};

export const tooltipRow = {
  display: 'flex' as const,
  gap: 6,
  alignItems: 'center' as const,
  padding: '1px 0',
};

export const tooltipLabel = {
  color: COLORS.textMuted,
  fontWeight: 500,
  fontSize: FONT.sm + 1,
};

export const statusDot = (color: string) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 5px ${color}`,
  flexShrink: 0,
});
