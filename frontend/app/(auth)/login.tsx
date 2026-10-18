import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import { LoginImpactCard } from '@/components/auth/LoginHero';
import { RegisterLeftBackdrop } from '@/components/auth/RegisterHero';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/ui';
import type { UserPublic } from '@/types/guardian';
import { loginStyles as styles } from './login.styles';

const IS_WEB = Platform.OS === 'web';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserPublic;
}

const useShake = () => {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () =>
    Animated.sequence([
      Animated.timing(x, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  return { x, shake };
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [btnHover, setBtnHover] = useState(false);
  const { x: shakeX, shake } = useShake();

  const fade = useRef(new Animated.Value(0)).current;

  const IS_WIDE = IS_WEB && width >= theme.layout.wideBreakpoint;

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const submit = async () => {
    setError(null);
    const em = email.trim();
    if (!em || !password) {
      setError('Completa correo y contraseña.');
      shake();
      return;
    }
    setLoading(true);
    if (!IS_WEB) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email: em,
        password,
      });
      const token = res.data.accessToken?.trim();
      if (!token) {
        setError('El servidor no devolvió un token válido. Intenta de nuevo.');
        shake();
        return;
      }
      await signIn(token);
      if (!IS_WEB) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch (err) {
      let msg = 'No pudimos iniciar sesión. Intenta de nuevo.';
      if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { error?: string };
        if (d.error) msg = d.error;
      }
      setError(msg);
      shake();
      if (!IS_WEB) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const leftColumnContent = (
    <>
      <View>
        <View style={styles.logoRow}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.brandWordmark}>Secondra</Text>
        </View>
        <Text style={styles.kicker}>RED DE CONFIANZA</Text>
        <Text style={styles.headline}>
          Tu reputación es tu <Text style={styles.headlineAccent}>mayor tesoro</Text>.
        </Text>
        <Text style={styles.loginSub}>
          Únete a una red donde los vecinos se respaldan entre sí para intercambios 100% seguros.
        </Text>
        <LoginImpactCard />
      </View>
      <Text style={styles.footerLeft}>Hecho con 💚 para el planeta · Secondra</Text>
    </>
  );

  const formBody = (
    <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeX }] }]}>
      <Text style={styles.formTitle}>Iniciar sesión</Text>
      <Text style={styles.formSubtitle}>Accede a tu cuenta</Text>

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View
          style={[
            styles.inputRow,
            focused === 'email' && styles.inputRowFocused,
          ]}
        >
          <Feather name="mail" size={18} color={theme.colors.muted} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            placeholder="nombre@ejemplo.com"
            placeholderTextColor={theme.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Contraseña</Text>
        <View
          style={[
            styles.inputRow,
            focused === 'password' && styles.inputRowFocused,
          ]}
        >
          <Feather name="lock" size={18} color={theme.colors.muted} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry={!showPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            onSubmitEditing={submit}
          />
          <Pressable
            style={styles.iconBtn}
            onPress={() => setShowPassword((s) => !s)}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.muted}
            />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.btn,
          loading && styles.btnLoading,
          pressed && !loading && styles.btnPressed,
          IS_WEB && btnHover && !pressed && !loading && styles.btnHover,
        ]}
        onHoverIn={() => IS_WEB && setBtnHover(true)}
        onHoverOut={() => IS_WEB && setBtnHover(false)}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>Iniciar sesión</Text>
        )}
      </Pressable>

      <View style={styles.linkRow}>
        <Link href="/forgot-password" asChild>
          <Pressable style={({ pressed }) => [pressed && styles.linkMutedPressed]}>
            <Text style={styles.linkMuted}>Olvidé mi contraseña</Text>
          </Pressable>
        </Link>
        <Link href="/register" asChild>
          <Pressable style={({ pressed }) => [pressed && styles.linkMutedPressed]}>
            <View style={styles.registerLine}>
              <Text style={styles.registerLead}>¿No tienes cuenta?</Text>
              <Text style={styles.linkAccent}>Crear cuenta</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={{ flex: 1, opacity: fade }}>
        {IS_WIDE ? (
          <View style={styles.shell}>
            <View style={styles.splitRow}>
              <View style={styles.leftGradient}>
                <RegisterLeftBackdrop style={{ flex: 1 }}>
                  <ScrollView
                    contentContainerStyle={styles.leftScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {leftColumnContent}
                  </ScrollView>
                </RegisterLeftBackdrop>
              </View>
              <ScrollView
                style={styles.rightPanel}
                contentContainerStyle={styles.rightInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {formBody}
              </ScrollView>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.mobileStack}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <RegisterLeftBackdrop style={styles.mobileHero}>
              <View style={styles.logoRow}>
                <Text style={styles.logoEmoji}>🌿</Text>
                <Text style={styles.brandWordmark}>Secondra</Text>
              </View>
              <Text style={styles.kicker}>RED DE CONFIANZA</Text>
              <Text style={styles.headline}>
                Tu reputación es tu <Text style={styles.headlineAccent}>mayor tesoro</Text>.
              </Text>
              <Text style={styles.loginSub}>
                Únete a una red donde los vecinos se respaldan entre sí para intercambios 100% seguros.
              </Text>
              <LoginImpactCard />
              <Text style={styles.footerLeft}>Hecho con 💚 para el planeta · Secondra</Text>
            </RegisterLeftBackdrop>
            <View style={styles.mobileFormOuter}>{formBody}</View>
          </ScrollView>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
