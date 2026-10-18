import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/ui';
import { useReceivedBackings } from '@/hooks/useReceivedBackings';
import { BackingCard } from './BackingCard';
import { receivedBackingsStyles as styles } from './receivedBackings.styles';

function countLabel(n: number): string {
  if (n === 1) return '1 persona da la cara por ti';
  return `${n} personas dan la cara por ti`;
}

export function ReceivedBackingsSection() {
  const { backings, loading, error, refresh } = useReceivedBackings();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconWell}>
          <Feather name="heart" size={18} color={theme.colors.primaryDark} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Gente que da la cara por ti</Text>
          <Text style={styles.subtitle}>
            Vecinos que te conocen y dan fe de quién eres. Acá vive tu credibilidad.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Reuniendo a quienes dan la cara por ti…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => void refresh()}
            style={({ pressed }) => [styles.retry, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </Pressable>
        </View>
      ) : backings.length === 0 ? (
        <View style={styles.emptyWell}>
          <View style={styles.iconWell}>
            <Feather name="users" size={22} color={theme.colors.primaryDark} />
          </View>
          <Text style={styles.emptyTitle}>Aún nadie ha dado la cara por ti</Text>
          <Text style={styles.emptyHint}>
            Cuando un vecino te respalde, su nombre y sus palabras aparecen acá. No hay
            apuro: la confianza se construye entre personas.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.count}>{countLabel(backings.length)}</Text>
          {backings.map((backing) => (
            <BackingCard key={backing.id} backing={backing} />
          ))}
        </View>
      )}
    </View>
  );
}
