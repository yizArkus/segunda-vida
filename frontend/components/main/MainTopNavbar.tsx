import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrustShield } from '@/components/trust/TrustShield';
import { shadows, theme } from '@/constants/ui';
import type { UserPublic } from '@/types/guardian';

export type MainTopNavbarProps = {
  guardianProfile: UserPublic | null;
  trustLoading: boolean;
  treasureCount: number;
  circulationFormatted: string;
  onSignOut: () => void | Promise<void>;
};

export function MainTopNavbar({
  guardianProfile,
  trustLoading,
  treasureCount,
  circulationFormatted,
  onSignOut,
}: MainTopNavbarProps) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = guardianProfile
    ? `${guardianProfile.firstName} ${guardianProfile.lastName}`.trim() || 'Guardián'
    : 'Guardián';

  const initial =
    (guardianProfile?.firstName?.trim()?.charAt(0) ||
      guardianProfile?.email?.charAt(0) ||
      '?').toUpperCase();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
      closeMenu();
    }
  };

  return (
    <>
      <View style={styles.navbar}>
        <View style={styles.left}>
          <Text style={styles.logoEmoji} accessibilityLabel="Secondra">
            🌿
          </Text>
          <Text style={styles.brandWord}>Secondra</Text>
        </View>

        <View style={styles.rightCol}>
          <View style={styles.userTrustRow}>
            <Pressable
              style={({ pressed }) => [styles.userChip, pressed && styles.userChipPressed]}
              onPress={() => setMenuOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={`Menú de ${displayName}`}
              accessibilityHint="Abre opciones de cuenta, incluido cerrar sesión"
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
              <View style={styles.userTexts}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                {guardianProfile?.email ? (
                  <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
                    {guardianProfile.email}
                  </Text>
                ) : null}
              </View>
              <Feather
                name={menuOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.colors.trustSecurity}
              />
            </Pressable>

            {trustLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : guardianProfile ? (
              <TrustShield
                trustLevel={guardianProfile.trustLevel}
                backingCount={guardianProfile.backingCount}
                variant="badge"
              />
            ) : null}
          </View>

          <Text style={styles.econLine} numberOfLines={1}>
            <Text style={styles.econNum}>{treasureCount}</Text>
            <Text style={styles.econMuted}> tesoros</Text>
            <Text style={styles.econSep}> · </Text>
            <Text style={styles.econNum}>{circulationFormatted}</Text>
            <Text style={styles.econMuted}> en circulación</Text>
          </Text>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable style={styles.modalBackdrop} onPress={closeMenu} accessibilityLabel="Cerrar menú" />
          <View
            style={[
              styles.dropdown,
              {
                top: insets.top + theme.spacing.sm + 4,
                right: theme.spacing.md,
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              style={({ pressed }) => [
                styles.dropdownRow,
                pressed && styles.dropdownRowPressed,
                signingOut && { opacity: 0.6 },
              ]}
              onPress={handleSignOut}
              disabled={signingOut}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
            >
              {signingOut ? (
                <ActivityIndicator size="small" color={theme.colors.danger} />
              ) : (
                <Feather name="log-out" size={18} color={theme.colors.danger} />
              )}
              <Text style={styles.dropdownRowText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.cardSubtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexShrink: 0,
  },
  logoEmoji: {
    fontSize: 30,
  },
  brandWord: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.trustSecurity,
    letterSpacing: -0.4,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    gap: 6,
  },
  userTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    maxWidth: '100%',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    paddingRight: 4,
    borderRadius: 16,
    backgroundColor: theme.colors.canvasMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: 200,
  },
  userChipPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  userTexts: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.muted,
    marginTop: 1,
  },
  econLine: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.muted,
    textAlign: 'right',
    maxWidth: '100%',
  },
  econNum: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  econMuted: {
    fontWeight: '600',
    color: theme.colors.muted,
    textTransform: 'lowercase',
  },
  econSep: {
    color: theme.colors.border,
    fontWeight: '400',
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 62, 80, 0.18)',
  },
  dropdown: {
    position: 'absolute',
    minWidth: 220,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    ...shadows.card,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  dropdownRowPressed: {
    backgroundColor: theme.colors.errorBackground,
  },
  dropdownRowText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.danger,
  },
});
