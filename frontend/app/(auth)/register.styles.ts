import { Platform, StyleSheet } from 'react-native';
import { theme } from '@/constants/ui';

const IS_WEB = Platform.OS === 'web';

export const WEB_VIEWPORT_MIN_HEIGHT = '100vh' as const;

const fontUi = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  default: undefined,
});

const inputImmersiveBg = '#f5faf7';
const inputBorderSoft = 'rgba(46, 204, 113, 0.14)';
const subtitleSoft = '#8e9aa3';
const hintMuted = '#a8b4bd';

export const registerStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: theme.colors.canvasMuted,
  },
  shell: {
    width: '100%',
    maxWidth: theme.layout.maxContentWidth,
    alignSelf: 'center',
    flex: 1,
    ...(IS_WEB ? { minHeight: WEB_VIEWPORT_MIN_HEIGHT as unknown as number } : {}),
  },
  splitRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    ...(IS_WEB ? { minHeight: WEB_VIEWPORT_MIN_HEIGHT as unknown as number } : {}),
  },
  leftBackdropRoot: {
    minWidth: IS_WEB ? 200 : undefined,
    overflow: 'hidden',
  },
  /** ~25% del shell (flex 1:3): prioriza ancho legible del formulario (BMAD). */
  leftGradient: {
    flex: 1,
    minWidth: IS_WEB ? 180 : undefined,
    overflow: 'hidden',
  },
  leftScrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  logoEmoji: { fontSize: 32 },
  brandWordmark: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    fontFamily: fontUi,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#6ee7b7',
    marginBottom: theme.spacing.sm,
    fontFamily: fontUi,
  },
  headline: {
    fontSize: IS_WEB ? 24 : 20,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: IS_WEB ? 32 : 28,
    fontFamily: fontUi,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  headlineAccent: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  mission: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 23,
    marginTop: theme.spacing.sm,
    fontFamily: fontUi,
  },
  /** Glass card shell (BlurView + borde fino). */
  featuredCardGlass: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius * 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  featuredImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: theme.radius,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featuredCardInner: {
    padding: theme.spacing.md,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110, 231, 183, 0.18)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius,
    marginBottom: theme.spacing.sm,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#c6f6e0',
    fontFamily: fontUi,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: fontUi,
  },
  featuredSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 6,
    lineHeight: 20,
    fontFamily: fontUi,
  },
  co2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },
  co2Text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86efac',
    fontFamily: fontUi,
  },
  footerLeft: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: theme.spacing.xl,
    fontFamily: fontUi,
  },
  rightPanel: {
    flex: 3,
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    minWidth: 320,
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: '100%',
      },
      default: {},
    }),
  },
  rightInner: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 40,
    paddingVertical: 40,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        minWidth: 0,
        boxSizing: 'border-box',
      },
      default: {},
    }),
  },
  formMeasure: {
    width: '100%',
    alignSelf: 'stretch',
  },
  formCard: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  formTitle: {
    fontSize: IS_WEB ? 32 : 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: theme.colors.text,
    fontFamily: fontUi,
    width: '100%',
    flexShrink: 0,
    ...Platform.select({
      web: {
        whiteSpace: 'normal',
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      },
      default: {},
    }),
  },
  formSubtitle: {
    fontSize: 15,
    color: subtitleSoft,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    lineHeight: 23,
    fontFamily: fontUi,
    width: '100%',
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: theme.spacing.md,
    width: '100%',
    alignItems: 'flex-start',
  },
  half: {
    flex: 1,
    minWidth: 140,
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  fieldBlock: {
    marginBottom: theme.spacing.md,
    width: '100%',
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: fontUi,
    flexShrink: 0,
    alignSelf: 'flex-start',
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        width: 'auto',
        maxWidth: '100%',
      },
      default: {},
    }),
  },
  inputWrap: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: inputImmersiveBg,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: inputBorderSoft,
    paddingHorizontal: theme.spacing.sm + 2,
    minHeight: 50,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 1px 6px rgba(12, 45, 32, 0.06)',
      },
      default: {},
    }),
  },
  inputWrapFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ffffff',
    ...Platform.select({
      web: {
        boxShadow:
          'inset 0 1px 5px rgba(12, 45, 32, 0.05), 0 0 0 1px rgba(46, 204, 113, 0.55), 0 0 22px rgba(46, 204, 113, 0.18)',
      },
      default: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  inputWrapError: { borderColor: theme.colors.danger },
  input: {
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    fontFamily: fontUi,
    width: '100%',
    minWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },
  hintSmall: {
    fontSize: 10,
    fontStyle: 'italic',
    color: hintMuted,
    marginTop: 6,
    lineHeight: 15,
    fontFamily: fontUi,
  },
  errSmall: { fontSize: 11, color: theme.colors.danger, marginTop: 4 },
  errorBanner: {
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  errorText: { fontSize: 13, color: theme.colors.danger, fontWeight: '600' },
  okBanner: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  okText: { fontSize: 14, color: theme.colors.primaryDark, fontWeight: '600' },
  btn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    paddingVertical: theme.spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 32px rgba(46, 204, 113, 0.38), 0 4px 12px rgba(20, 60, 40, 0.12)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  btnLoading: { backgroundColor: theme.colors.primaryDark },
  btnPressed: { backgroundColor: theme.colors.primaryDark, opacity: 0.96 },
  btnHover: {
    ...Platform.select({
      web: {
        transform: [{ scale: 1.02 }],
        boxShadow: '0 14px 36px rgba(46, 204, 113, 0.45), 0 6px 16px rgba(20, 60, 40, 0.14)',
      },
      default: {},
    }),
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  btnText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '700', fontFamily: fontUi },
  linkBtn: { alignItems: 'center', paddingVertical: theme.spacing.md, marginTop: theme.spacing.sm },
  linkText: { fontSize: 14, color: theme.colors.primaryDark, fontWeight: '600', fontFamily: fontUi },
  mobileStack: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
  mobileHero: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  mobileFormOuter: {
    paddingHorizontal: 40,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
  },
});
