import React from 'react';
import { Platform, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { loginStyles } from '@/app/(auth)/login.styles';

const styles = loginStyles;

/** Vista previa ficticia tipo dashboard — glassmorphism, alineada al registro. */
export function LoginImpactCard() {
  const intensity = Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? 32 : 40;

  return (
    <BlurView intensity={intensity} tint="dark" style={styles.loginGlassCard}>
      <View style={styles.loginGlassInner}>
        <Text style={styles.impactKicker}>PROTOCOLO DE RESPALDO</Text>
        <View style={styles.impactBlock}>
          <Text style={styles.impactLabel}>Guardián más respaldado hoy</Text>
          <Text style={styles.impactHighlight}>Vecinos de confianza</Text>
        </View>
        <View style={styles.impactDivider} />
        <View style={styles.impactRow}>
          <View style={styles.impactBullet} />
          <Text style={styles.impactMuted}>
            Tu impacto: <Text style={styles.impactAccent}>12 kg</Text> CO₂ y cierre seguro
          </Text>
        </View>
        <View style={styles.impactRow}>
          <View style={styles.impactBullet} />
          <Text style={styles.impactMuted}>
            Comunidad: <Text style={styles.impactAccent}>5</Text> nuevos respaldos cerca de ti
          </Text>
        </View>
      </View>
    </BlurView>
  );
}
