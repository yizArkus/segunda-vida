import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '@/constants/ui';

/**
 * Marcador de posición — recuperación de contraseña (fuera del alcance API v1 en spec).
 */
export default function ForgotPasswordScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.canvasMuted,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: theme.colors.text,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        Recuperación de contraseña — próximamente.
      </Text>
      <Link href="/login" asChild>
        <Pressable>
          <Text style={{ fontSize: 15, color: theme.colors.primaryDark, fontWeight: '600' }}>
            Volver al inicio de sesión
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
