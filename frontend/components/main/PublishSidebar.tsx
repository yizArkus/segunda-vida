import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/ui';
import type { UserPublic } from '@/types/guardian';
import { TrustShield } from '@/components/trust/TrustShield';

type PublishSidebarProps = {
  itemCount: number;
  profile: UserPublic | null;
};

export function PublishSidebar({ itemCount, profile }: PublishSidebarProps) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Centro de publicación</Text>
      <Text style={styles.subtitle}>Gestiona tus tesoros y tu reputación</Text>

      {profile ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Escudo del Guardián</Text>
          <TrustShield trustLevel={profile.trustLevel} backingCount={profile.backingCount} compact />
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Atajos</Text>
        <View style={styles.itemRow}>
          <Feather name="package" size={15} color={theme.colors.trustSecurity} />
          <Text style={styles.itemText}>Tesoros publicados: {itemCount}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="shield" size={15} color={theme.colors.trustSecurity} />
          <Text style={styles.itemText}>Refuerza tu confianza con respaldos</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="map-pin" size={15} color={theme.colors.trustSecurity} />
          <Text style={styles.itemText}>Comparte ubicación segura de entrega</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.muted,
  },
  block: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.trustSecuritySoft,
    gap: theme.spacing.xs,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.trustSecurity,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.trustSecurity,
  },
});
