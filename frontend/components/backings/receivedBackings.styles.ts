import { StyleSheet } from 'react-native';
import { shadows, theme } from '@/constants/ui';

export const receivedBackingsStyles = StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  list: {
    gap: theme.spacing.sm,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  emptyWell: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    ...shadows.button,
  },
  retryText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
