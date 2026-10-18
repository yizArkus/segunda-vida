import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/ui';
import type { GuardianBackingReceived, TrustLevel } from '@/types/guardian';
import { backingCardStyles as styles } from './backingCard.styles';

const LEVEL_LABELS: Record<TrustLevel, string> = {
  novato: 'Novato',
  vecinoConfiable: 'Vecino confiable',
  guardianHonor: 'Guardián de honor',
};

function initials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  const letters = `${a}${b}`.toUpperCase();
  return letters || 'G';
}

function relativeDate(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? 'hace 1 hora' : `hace ${hrs} horas`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

type Props = {
  backing: GuardianBackingReceived;
};

export function BackingCard({ backing }: Props) {
  const name = `${backing.vouchingFirstName} ${backing.vouchingLastName}`.trim();
  const isHonor = backing.vouchingTrustLevel === 'guardianHonor';
  const fg = isHonor ? theme.colors.honorGold : theme.colors.trustSecurity;
  const bg = isHonor ? theme.colors.honorGoldSoft : theme.colors.trustSecuritySoft;
  const hasVouch = Boolean(backing.vouchText?.trim());

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(backing.vouchingFirstName, backing.vouchingLastName)}
          </Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {name || 'Guardián'}
          </Text>
          <Text style={styles.date}>{relativeDate(backing.createdAt)}</Text>
        </View>
      </View>
      <View style={[styles.seal, { backgroundColor: bg, borderColor: fg }]}>
        <Feather name="shield" size={12} color={fg} />
        <Text style={[styles.sealText, { color: fg }]}>
          {LEVEL_LABELS[backing.vouchingTrustLevel]}
        </Text>
      </View>
      {hasVouch ? (
        <View style={styles.vouchWell}>
          <Text style={styles.vouch}>“{backing.vouchText}”</Text>
        </View>
      ) : (
        <Text style={styles.vouchEmpty}>Dio la cara por ti, sin palabras de más.</Text>
      )}
    </View>
  );
}
