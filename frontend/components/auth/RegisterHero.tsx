import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { registerStyles } from '@/app/(auth)/register.styles';

const styles = registerStyles;

/** Silla vintage de madera — Unsplash (licencia Unsplash). */
const TREASURE_CHAIR_URI =
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=85&auto=format&fit=crop';

/** Capas de gradiente + patrón orgánico tenue (BMAD: profundidad, calidez). */
export function RegisterLeftBackdrop({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.leftBackdropRoot, style]}>
      <LinearGradient
        colors={['#06120c', '#0c1f14', '#122a1f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Resplandor central tipo radial (#2ecc71) */}
      <LinearGradient
        colors={['rgba(46,204,113,0.38)', 'rgba(20,75,52,0.22)', 'transparent']}
        locations={[0, 0.42, 1]}
        start={{ x: 0.42, y: 0.32 }}
        end={{ x: 0.95, y: 0.95 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(46,204,113,0.12)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.35, y: 0.45 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Vignette inferior para legibilidad */}
      <LinearGradient
        colors={['transparent', 'rgba(4,14,10,0.92)', '#040e0a']}
        locations={[0.35, 0.78, 1]}
        start={{ x: 0.5, y: 0.15 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <OrganicPattern />
      {children}
    </View>
  );
}

function OrganicPattern() {
  return (
    <Svg
      style={[StyleSheet.absoluteFillObject, { opacity: 1 }]}
      width="100%"
      height="100%"
      viewBox="0 0 400 820"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      <Circle cx="90" cy="140" r="190" fill="#ffffff" opacity={0.05} />
      <Ellipse cx="310" cy="420" rx="210" ry="150" fill="#a7f3d0" opacity={0.05} />
      <Path
        d="M-20,620 C120,520 280,680 420,560 L420,840 L-20,840 Z"
        fill="#6ee7b7"
        opacity={0.05}
      />
      <Circle cx="340" cy="120" r="80" fill="#ffffff" opacity={0.04} />
    </Svg>
  );
}

/** Tarjeta glassmorphism sobre el hero oscuro + foto real del tesoro. */
export function FeaturedTreasureCard() {
  const inner = (
    <View style={styles.featuredCardInner}>
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredBadgeText}>CONFIANZA EN LA RED</Text>
      </View>
      <Image
        source={{ uri: TREASURE_CHAIR_URI }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={200}
        accessibilityLabel="Silla de madera vintage restaurada, textura visible"
      />
      <Text style={styles.featuredTitle}>Silla vintage restaurada</Text>
      <Text style={styles.featuredSub}>Historias reales, intercambios respaldados por vecinos.</Text>
      <View style={styles.co2Row}>
        <Text style={{ fontSize: 16 }}>🌍</Text>
        <Text style={styles.co2Text}>Ahorro simbólico de CO₂: 2,5 kg</Text>
      </View>
    </View>
  );

  const intensity = Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? 32 : 40;

  return (
    <BlurView intensity={intensity} tint="dark" style={styles.featuredCardGlass}>
      {inner}
    </BlurView>
  );
}
