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

export const loginStyles = StyleSheet.create({
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
  loginSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 24,
    marginTop: theme.spacing.sm,
    fontFamily: fontUi,
  },
  loginGlassCard: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius * 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  loginGlassInner: {
    padding: theme.spacing.md,
  },
  impactKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: theme.spacing.sm,
    fontFamily: fontUi,
  },
  impactBlock: {
    marginBottom: theme.spacing.sm,
  },
  impactLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontUi,
  },
  impactHighlight: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    fontFamily: fontUi,
  },
  impactDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginVertical: theme.spacing.sm,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  impactBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
  },
  impactMuted: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
    fontFamily: fontUi,
  },
  impactAccent: {
    fontWeight: '800',
    color: '#86efac',
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
  },
  formSubtitle: {
    fontSize: 15,
    color: subtitleSoft,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    lineHeight: 23,
    fontFamily: fontUi,
  },
  fieldBlock: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: fontUi,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
      },
      default: {},
    }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: inputImmersiveBg,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: inputBorderSoft,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    minHeight: 50,
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 1px 6px rgba(12, 45, 32, 0.06)',
      },
      default: {},
    }),
  },
  inputRowFocused: {
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
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    fontFamily: fontUi,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },
  iconBtn: {
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  errorText: { fontSize: 13, color: theme.colors.danger, fontWeight: '600' },
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
  btnText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '700', fontFamily: fontUi },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  linkMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.muted,
    fontFamily: fontUi,
  },
  linkMutedPressed: {
    opacity: 0.75,
  },
  registerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  registerLead: {
    fontSize: 13,
    color: theme.colors.muted,
    fontFamily: fontUi,
  },
  linkAccent: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    fontFamily: fontUi,
    textDecorationLine: 'underline',
  },
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
