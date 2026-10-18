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
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import { FeaturedTreasureCard, RegisterLeftBackdrop } from '@/components/auth/RegisterHero';
import { theme } from '@/constants/ui';
import { registerStyles as styles } from './register.styles';

const IS_WEB = Platform.OS === 'web';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasRegistrationUppercase = (s: string) => /\p{Lu}/u.test(s);
const hasRegistrationDigit = (s: string) => /\p{Nd}/u.test(s);

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

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [formColumnWidth, setFormColumnWidth] = useState(0);
  const [btnHover, setBtnHover] = useState(false);
  const { x: shakeX, shake } = useShake();
  const fade = useRef(new Animated.Value(0)).current;

  const IS_WIDE = IS_WEB && width >= theme.layout.wideBreakpoint;
  const formTwoColumn = formColumnWidth >= theme.layout.formRowBreakpoint;

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: true }).start();
  }, [fade]);

  const validate = () => {
    const e: Record<string, string> = {};
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const ph = phone.trim();
    const zp = zipCode.trim();
    if (!fn) e.firstName = 'El nombre es obligatorio';
    else if (fn.length > 100) e.firstName = 'Máximo 100 caracteres';
    if (!ln) e.lastName = 'El apellido es obligatorio';
    else if (ln.length > 100) e.lastName = 'Máximo 100 caracteres';
    if (!em) e.email = 'El correo es obligatorio';
    else if (!EMAIL_RE.test(em)) e.email = 'Correo no válido';
    else if (em.length > 254) e.email = 'Correo demasiado largo';
    if (!password) e.password = 'La contraseña es obligatoria.';
    else if (password.length < 8 || password.length > 128)
      e.password = 'La contraseña debe tener entre 8 y 128 caracteres.';
    else if (!hasRegistrationUppercase(password))
      e.password = 'La contraseña debe incluir al menos una letra mayúscula.';
    else if (!hasRegistrationDigit(password))
      e.password = 'La contraseña debe incluir al menos un número.';
    if (!ph) e.phone = 'El teléfono es obligatorio';
    else if (ph.length < 8 || ph.length > 20) e.phone = 'Entre 8 y 20 caracteres';
    if (!zp) e.zipCode = 'El código postal es obligatorio';
    else if (zp.length > 20) e.zipCode = 'Máximo 20 caracteres';
    setErrors(e);
    if (Object.keys(e).length) {
      shake();
      if (!IS_WEB) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setBanner(null);
    setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    if (!IS_WEB) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        zipCode: zipCode.trim(),
      });
      setSuccess('Cuenta creada. Ya puedes iniciar sesión.');
      if (!IS_WEB) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      let msg = 'No pudimos completar el registro.';
      if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { error?: string };
        if (d.error) msg = d.error;
      }
      setBanner(msg);
      shake();
      if (!IS_WEB) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const clearFormFeedback = () => {
    setBanner(null);
    setSuccess(null);
    setErrors({});
  };

  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    key: string,
    opts?: {
      secure?: boolean;
      keyboard?: 'default' | 'email-address' | 'phone-pad';
      hint?: string;
    },
  ) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused === key && styles.inputWrapFocused,
          errors[key] ? styles.inputWrapError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => {
            set(t);
            clearFormFeedback();
          }}
          placeholderTextColor={theme.colors.muted}
          secureTextEntry={opts?.secure}
          keyboardType={opts?.keyboard ?? 'default'}
          autoCapitalize={opts?.keyboard === 'email-address' ? 'none' : 'sentences'}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused(null)}
        />
      </View>
      {opts?.hint && !errors[key] ? <Text style={styles.hintSmall}>{opts.hint}</Text> : null}
      {errors[key] ? <Text style={styles.errSmall}>{errors[key]}</Text> : null}
    </View>
  );

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
        <Text style={styles.mission}>
          Únete a una red donde los vecinos se respaldan entre sí para intercambios 100% seguros.
        </Text>
        <FeaturedTreasureCard />
      </View>
      <Text style={styles.footerLeft}>Hecho con 💚 para el planeta · Secondra</Text>
    </>
  );

  const formBody = (
    <View
      style={styles.formMeasure}
      onLayout={(e) => setFormColumnWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeX }] }]}>
      <Text style={styles.formTitle}>Crear cuenta</Text>
      <Text style={styles.formSubtitle}>Regístrate y empieza a salvar tesoros con Secondra.</Text>

      {banner ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorText}>{banner}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.okBanner}>
          <Text style={styles.okText}>{success}</Text>
        </View>
      ) : null}

      {formTwoColumn ? (
        <View style={styles.row}>
          <View style={styles.half}>{field('Nombre', firstName, setFirstName, 'firstName')}</View>
          <View style={styles.half}>{field('Apellido', lastName, setLastName, 'lastName')}</View>
        </View>
      ) : (
        <>
          {field('Nombre', firstName, setFirstName, 'firstName')}
          {field('Apellido', lastName, setLastName, 'lastName')}
        </>
      )}

      {field('Correo electrónico', email, setEmail, 'email', { keyboard: 'email-address' })}

      {formTwoColumn ? (
        <View style={styles.row}>
          <View style={styles.half}>{field('Teléfono', phone, setPhone, 'phone', { keyboard: 'phone-pad' })}</View>
          <View style={styles.half}>{field('Código postal', zipCode, setZipCode, 'zipCode')}</View>
        </View>
      ) : (
        <>
          {field('Teléfono', phone, setPhone, 'phone', { keyboard: 'phone-pad' })}
          {field('Código postal', zipCode, setZipCode, 'zipCode')}
        </>
      )}

      {field('Contraseña', password, setPassword, 'password', {
        secure: true,
        hint: 'Mínimo 8 caracteres, una mayúscula y un número.',
      })}

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
        disabled={loading || !!success}
      >
        {loading ? (
          <View style={styles.btnRow}>
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
            <Text style={styles.btnText}>Creando cuenta…</Text>
          </View>
        ) : (
          <Text style={styles.btnText}>Crear cuenta</Text>
        )}
      </Pressable>

      <Link href="/login" asChild>
        <Pressable style={styles.linkBtn}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Iniciar sesión</Text>
        </Pressable>
      </Link>
    </Animated.View>
    </View>
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
              <Text style={styles.mission}>
                Únete a una red donde los vecinos se respaldan entre sí para intercambios 100% seguros.
              </Text>
              <FeaturedTreasureCard />
              <Text style={styles.footerLeft}>Hecho con 💚 para el planeta · Secondra</Text>
            </RegisterLeftBackdrop>
            <View style={styles.mobileFormOuter}>{formBody}</View>
          </ScrollView>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
