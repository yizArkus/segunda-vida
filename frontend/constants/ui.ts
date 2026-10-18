/**
 * Tokens de UI Secondra — fuente: specs/secondra-spec.yaml → client.ui.tokens
 * (paleta, ancho web, radio 12px, espaciado base 8px).
 */
export const theme = {
  colors: {
    primary: '#2ecc71',
    primaryDark: '#27ae60',
    primaryLight: '#eafaf1',
    /** Spec ui_standards + client.ui */
    background: '#ffffff',
    canvasMuted: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    muted: '#636e72',
    border: '#dfe6e9',
    danger: '#e74c3c',
    errorBackground: '#fdecea',
    errorBorder: '#f5c6cb',
    onPrimary: '#ffffff',
    shadow: '#000000',
    whatsappAccent: '#25D366',
    whatsappSoft: '#f0fdf4',
    /** Confianza / respaldo (spec client.ui + BMAD). */
    trustSecurity: '#1e3a5f',
    trustSecuritySoft: '#e8eef5',
    honorGold: '#c9a227',
    honorGoldSoft: '#faf6e8',
    info: '#2980b9',
    infoSoft: '#eaf4fb',
    warnSoft: '#fdf0ef',
    warn: '#c0392b',
    surfaceMuted: '#fafafa',
    skeleton: '#e8ecef',
  },
  radius: 12,
  spacing: {
    unit: 8,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  layout: {
    maxContentWidth: 800,
    wideBreakpoint: 720,
    /** Ancho mínimo del bloque del formulario para filas dobles (nombre/apellido, tel/CP). */
    formRowBreakpoint: 600,
  },
} as const;

export type Theme = typeof theme;

export const shadows = {
  card: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSubtle: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  itemCard: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;
