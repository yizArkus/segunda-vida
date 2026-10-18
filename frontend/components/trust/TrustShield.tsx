import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/ui';
import type { TrustLevel } from '@/types/guardian';

const LABELS: Record<TrustLevel, string> = {
  novato: 'Novato',
  vecinoConfiable: 'Vecino confiable',
  guardianHonor: 'Guardián de honor',
};

type Props = {
  trustLevel: TrustLevel;
  backingCount: number;
  /** Compacto para filas de tarjeta. */
  compact?: boolean;
  /** Una sola línea, para navbar / chips. */
  variant?: 'default' | 'badge';
  /** true = copy por ti; false = copy por este Guardián (tarjetas). */
  forSelf?: boolean;
};

export function TrustShield({
  trustLevel,
  backingCount,
  compact,
  variant = 'default',
  forSelf = true,
}: Props) {
  const isHonor = trustLevel === 'guardianHonor';
  const fg = isHonor ? theme.colors.honorGold : theme.colors.trustSecurity;
  const bg = isHonor ? theme.colors.honorGoldSoft : theme.colors.trustSecuritySoft;

  const accessibilityLabel = forSelf
    ? `${LABELS[trustLevel]}. ${backingCount} personas dan la cara por ti.`
    : `${LABELS[trustLevel]}. ${backingCount} respaldos en la red.`;

  if (variant === 'badge') {
    const sub = forSelf
      ? `${backingCount} ${backingCount === 1 ? 'da la cara' : 'dan la cara'}`
      : `${backingCount} ${backingCount === 1 ? 'respaldo' : 'respaldos'}`;
    return (
      <View
        style={[styles.badgeWrap, { backgroundColor: bg, borderColor: fg }]}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        <Feather name="shield" size={13} color={fg} />
        <Text style={styles.badgeLine} numberOfLines={1}>
          <Text style={[styles.badgeLevel, { color: fg }]}>{LABELS[trustLevel]}</Text>
          <Text style={styles.badgeMuted}> · {sub}</Text>
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.wrap, { backgroundColor: bg, borderColor: fg }]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name="shield" size={compact ? 14 : 16} color={fg} />
      <View style={styles.textCol}>
        <Text style={[styles.level, { color: fg }]} numberOfLines={1}>
          {LABELS[trustLevel]}
        </Text>
        <Text style={styles.backing} numberOfLines={1}>
          {forSelf
            ? `${backingCount} ${backingCount === 1 ? 'persona da la cara' : 'personas dan la cara'} por ti`
            : `${backingCount} ${backingCount === 1 ? 'respaldo' : 'respaldos'} en la red`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius,
    borderWidth: 1,
  },
  textCol: {
    flexShrink: 1,
    gap: 2,
  },
  level: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  backing: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius,
    borderWidth: 1,
  },
  badgeLine: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  badgeLevel: {
    fontWeight: '800',
  },
  badgeMuted: {
    color: theme.colors.muted,
    fontWeight: '600',
  },
});
