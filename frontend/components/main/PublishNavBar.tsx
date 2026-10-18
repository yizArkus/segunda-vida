import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/ui';

export type MainNavKey = 'inicio' | 'publicar' | 'respaldos' | 'cuenta' | 'ajustes';

type PublishNavBarProps = {
  onSelect: (key: MainNavKey) => void;
  activeTab: MainNavKey;
};

const TABS = [
  { key: 'inicio', label: 'Inicio', icon: 'home' },
  { key: 'publicar', label: 'Publicar', icon: 'layout' },
  { key: 'respaldos', label: 'Respaldos', icon: 'shield' },
  { key: 'cuenta', label: 'Cuenta', icon: 'user' },
  { key: 'ajustes', label: 'Ajustes', icon: 'settings' },
] as const;

export function PublishNavBar({ onSelect, activeTab }: PublishNavBarProps) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              active && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Feather
              name={tab.icon}
              size={18}
              color={active ? theme.colors.trustSecurity : theme.colors.muted}
            />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            {active ? <View style={styles.activeIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#d6d9e2',
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(23, 32, 68, 0.06)',
      },
      default: {},
    }),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    position: 'relative',
    borderRadius: theme.radius * 1.5,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 11,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: theme.colors.trustSecuritySoft,
    borderColor: '#d8e2ef',
  },
  tabPressed: {
    opacity: 0.82,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  tabTextActive: {
    color: theme.colors.trustSecurity,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    bottom: -6,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.trustSecurity,
  },
});
