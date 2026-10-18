import { StyleSheet } from 'react-native';
import { shadows, theme } from '@/constants/ui';

export const backingCardStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...shadows.cardSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  vouchWell: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  vouch: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  vouchEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.muted,
  },
  seal: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius,
    borderWidth: 1,
  },
  sealText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
