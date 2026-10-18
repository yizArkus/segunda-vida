import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import axios, { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { authHeaders, getAccessToken } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import { MainNavKey, PublishNavBar } from '@/components/main/PublishNavBar';
import { MainTopNavbar } from '@/components/main/MainTopNavbar';
import { PublishSidebar } from '@/components/main/PublishSidebar';
import { TrustShield } from '@/components/trust/TrustShield';
import { ReceivedBackingsSection } from '@/components/backings/ReceivedBackingsSection';
import { useGuardianTrust } from '@/hooks/useGuardianTrust';
import { shadows, theme } from '@/constants/ui';
import type { TrustLevel } from '@/types/guardian';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Responsive Breakpoint ────────────────────────────────────────────────────
//  We read the window width once at module level; for a fully dynamic approach
//  you could subscribe to Dimensions.addEventListener, but for Expo web this is
//  sufficient — the page remounts on resize.
const SCREEN_W   = Dimensions.get('window').width;
const IS_WEB     = Platform.OS === 'web';
const IS_WIDE    = IS_WEB && SCREEN_W >= theme.layout.wideBreakpoint;
const MAX_W      = theme.layout.maxContentWidth;
const FORM_COL_W = IS_WIDE ? (MAX_W - theme.spacing.md * 2 - theme.spacing.sm) / 2 : undefined;

// ─── Model ────────────────────────────────────────────────────────────────────
type Condition = 'Nuevo' | 'Bueno' | 'Regular';

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  seller?: string;
  condition?: Condition;
  location?: string;
  whatsapp?: string;
  imageUri?: string;
  postedAt?: string;
  /** ISO desde API (`createdAt` en JSON camelCase) */
  createdAt?: string;
  isNew?: boolean;
  _localPostedAt?: number;
  /** Cuando el backend exponga vínculo a Guardián (spec futuro). */
  guardianTrust?: { trustLevel: TrustLevel; backingCount: number };
}

/** Valores alineados a ItemCategory en secondra-spec.yaml (API: sin tilde en Electronica). */
const CATEGORY_VALUES = ['Ropa', 'Electronica', 'Hogar', 'Libros', 'Deportes', 'Otro'] as const;
const FILTER_ORDER = ['Todas', ...CATEGORY_VALUES] as const;

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  Todas: { label: 'Todas', icon: '🌿' },
  Ropa: { label: 'Ropa', icon: '👕' },
  Electronica: { label: 'Electrónica', icon: '💻' },
  Hogar: { label: 'Hogar', icon: '🏡' },
  Libros: { label: 'Libros', icon: '📚' },
  Deportes: { label: 'Deportes', icon: '🚴' },
  Otro: { label: 'Otro', icon: '✨' },
};
const CONDITION_META: Record<Condition, { color: string; bg: string; label: string }> = {
  Nuevo:   { color: theme.colors.primaryDark, bg: theme.colors.primaryLight, label: '🟢 Nuevo'   },
  Bueno:   { color: theme.colors.info,        bg: theme.colors.infoSoft,     label: '🔵 Bueno'   },
  Regular: { color: theme.colors.warn,        bg: theme.colors.warnSoft,     label: '🔴 Regular' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const timeAgo = (item: Item): string => {
  const ms = item._localPostedAt
    ?? (item.createdAt ? new Date(item.createdAt).getTime() : null)
    ?? (item.postedAt ? new Date(item.postedAt).getTime() : null);
  if (!ms) return '';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
};

// ─── useShake ─────────────────────────────────────────────────────────────────
const useShake = () => {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () =>
    Animated.sequence([
      Animated.timing(x, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue:  8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue:  6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue:  0, duration: 50, useNativeDriver: true }),
    ]).start();
  return { x, shake };
};

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
const SkeletonCard = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.itemCard, { opacity: pulse, padding: theme.spacing.sm }]}>
      <View style={[styles.skeletonLine, { width: '40%', height: 14, marginBottom: 10 }]} />
      <View style={[styles.skeletonLine, { width: '75%', height: 18, marginBottom: 8  }]} />
      <View style={[styles.skeletonLine, { width: '90%', height: 13                   }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <View style={[styles.skeletonLine, { width: 80, height: 13 }]} />
        <View style={[styles.skeletonLine, { width: 60, height: 22 }]} />
      </View>
    </Animated.View>
  );
};

// ─── ItemCard ─────────────────────────────────────────────────────────────────
const ItemCard = ({ item }: { item: Item }) => {
  const opacity    = useRef(new Animated.Value(item.isNew ? 0   : 1)).current;
  const translateY = useRef(new Animated.Value(item.isNew ? 16  : 0)).current;
  const scale      = useRef(new Animated.Value(item.isNew ? 0.97: 1)).current;
  const [expanded, setExpanded] = useState(false);
  const [liked,    setLiked]    = useState(false);

  useEffect(() => {
    if (item.isNew) {
      Animated.parallel([
        Animated.spring(scale,      { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const handleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  const handleLike = async () => {
    if (!IS_WEB) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked(l => !l);
  };

  const cond    = item.condition ? CONDITION_META[item.condition] : null;
  const initial = item.seller ? item.seller[0].toUpperCase() : '?';

  return (
    <Animated.View style={[styles.itemCard, { opacity, transform: [{ translateY }, { scale }] }]}>
      {item.imageUri
        ? <Image source={{ uri: item.imageUri }} style={styles.itemImage} resizeMode="cover" />
        : null}

      <View style={styles.itemTopRow}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap', flex: 1 }}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_META[item.category]?.icon ?? '✨'}{' '}
                {CATEGORY_META[item.category]?.label ?? item.category}
              </Text>
            </View>
          )}
          {cond && (
            <View style={[styles.categoryBadge, { backgroundColor: cond.bg }]}>
              <Text style={[styles.categoryBadgeText, { color: cond.color }]}>{cond.label}</Text>
            </View>
          )}
        </View>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>nuevo</Text>
          </View>
        )}
      </View>

      <Pressable onPress={handleExpand} style={{ gap: 4 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.itemDesc} numberOfLines={expanded ? undefined : 2}>
            {item.description}
          </Text>
        )}
        {item.description && item.description.length > 80 && (
          <Text style={styles.expandToggle}>{expanded ? 'Ver menos ↑' : 'Ver más ↓'}</Text>
        )}
      </Pressable>

      {item.location && <Text style={styles.locationText}>📍 {item.location}</Text>}

      <View style={styles.itemFooter}>
        <View style={styles.sellerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ gap: 1, flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              {item.seller ? <Text style={styles.sellerName}>{item.seller}</Text> : null}
              {item.guardianTrust ? (
                <TrustShield
                  trustLevel={item.guardianTrust.trustLevel}
                  backingCount={item.guardianTrust.backingCount}
                  compact
                  forSelf={false}
                />
              ) : null}
            </View>
            {timeAgo(item) ? <Text style={styles.timeAgo}>{timeAgo(item)}</Text> : null}
          </View>
        </View>
        <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, liked && styles.actionBtnActive]}
          onPress={handleLike}
        >
          <Text style={[styles.actionBtnText, liked && styles.actionBtnTextActive]}>
            {liked ? '💚 Me interesa' : '🤍 Me interesa'}
          </Text>
        </Pressable>
        {item.whatsapp && (
          <Pressable
            style={[styles.actionBtn, styles.actionBtnWA]}
            onPress={async () => {
              if (!IS_WEB) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('WhatsApp', `Contactar a ${item.seller ?? 'vendedor'}: ${item.whatsapp}`);
            }}
          >
            <Text style={[styles.actionBtnText, { color: theme.colors.whatsappAccent }]}>💬 Contactar</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🌱</Text>
    <Text style={styles.emptyTitle}>Aún no hay tesoros publicados.</Text>
    <Text style={styles.emptyText}>¡Sé el primero en darle una segunda vida a algo!</Text>
  </View>
);

// ─── FloatingInput ────────────────────────────────────────────────────────────
const FloatingInput = ({
  label, value, onChangeText,
  keyboardType = 'default', multiline = false,
  error, prefix, placeholder,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  multiline?: boolean; error?: string; prefix?: string; placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        multiline && styles.inputWrapperMulti,
        focused   && styles.inputWrapperFocused,
        !!error   && styles.inputWrapperError,
      ]}>
        {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, multiline && { height: 72, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder ?? label}
          placeholderTextColor={theme.colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// ─── ConditionPicker ──────────────────────────────────────────────────────────
const ConditionPicker = ({
  value, onSelect,
}: { value: Condition; onSelect: (c: Condition) => void }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>Estado del artículo</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(['Nuevo', 'Bueno', 'Regular'] as Condition[]).map(c => {
        const m = CONDITION_META[c];
        const active = value === c;
        return (
          <Pressable
            key={c}
            style={[styles.conditionChip, active && { backgroundColor: m.bg, borderColor: m.color }]}
            onPress={() => onSelect(c)}
          >
            <Text style={[styles.conditionChipText, active && { color: m.color, fontWeight: '700' }]}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

// ─── CategorySelect (inside form) ─────────────────────────────────────────────
const CategorySelect = ({
  value, onSelect,
}: { value: string; onSelect: (c: string) => void }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>Categoría</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {CATEGORY_VALUES.map(cat => (
        <Pressable
          key={cat}
          style={[styles.chip, value === cat && styles.chipActive]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[styles.chipText, value === cat && styles.chipTextActive]}>
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
);

// ─── ImagePickerField ─────────────────────────────────────────────────────────
const ImagePickerField = ({
  uri, onPick,
}: { uri: string; onPick: (u: string) => void }) => {
  const pick = async () => {
    if (IS_WEB) {
      // On web, use a hidden <input type="file"> to avoid native permission dialogs
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) onPick(URL.createObjectURL(file));
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!result.canceled) onPick(result.assets[0].uri);
  };

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>Foto del producto</Text>
      <Pressable onPress={pick} style={styles.imagePicker}>
        {uri ? (
          // Cap image height on web so it doesn't become a billboard
          <Image
            source={{ uri }}
            style={[styles.imagePreview, IS_WIDE && { height: 220 }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, IS_WIDE && { height: 120 }]}>
            <Text style={styles.imagePlaceholderIcon}>📷</Text>
            <Text style={styles.imagePlaceholderText}>Toca para agregar foto</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { signOut } = useAuth();
  const { profile: guardianProfile, loading: trustLoading } = useGuardianTrust();
  const scrollRef = useRef<ScrollView>(null);
  const [publishY, setPublishY] = useState(0);
  const [respaldosY, setRespaldosY] = useState(0);
  const [activeNav, setActiveNav] = useState<MainNavKey>('publicar');
  const [items, setItems]           = useState<Item[]>([]);
  const [name, setName]             = useState('');
  const [description, setDesc]      = useState('');
  const [price, setPrice]           = useState('');
  const [seller, setSeller]         = useState('');
  const [category, setCategory]     = useState('Otro');
  const [condition, setCondition]   = useState<Condition>('Bueno');
  const [location, setLocation]     = useState('');
  const [whatsapp, setWhatsapp]     = useState('');
  const [imageUri, setImageUri]     = useState('');
  const [filterCat, setFilterCat]   = useState('Todas');
  const [loading, setLoading]       = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const { x: shakeX, shake } = useShake();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`);
      setItems(res.data);
    } catch (e) {
      console.error('Error backend:', e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name   = 'Ponle un nombre a tu tesoro';
    if (!seller.trim()) e.seller = '¿Cómo te llamamos?';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      e.price = 'Ingresa un precio válido';
    if (!location.trim()) e.location = 'Indica colonia o ciudad';
    const wa = whatsapp.trim();
    if (!wa) e.whatsapp = 'El WhatsApp es obligatorio';
    else if (wa.length < 8 || wa.length > 32) e.whatsapp = 'Entre 8 y 32 caracteres';
    setErrors(e);
    if (Object.keys(e).length) {
      shake();
      if (!IS_WEB) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return Object.keys(e).length === 0;
  };

  const saveItem = async () => {
    if (!validate()) return;
    const token = await getAccessToken();
    if (!token) {
      await signOut();
      router.replace('/login');
      return;
    }
    setPublishing(true);
    if (!IS_WEB) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        condition,
        location: location.trim(),
        whatsapp: whatsapp.trim(),
      };
      if (description.trim()) payload.description = description.trim();

      const res = await axios.post(`${API_URL}/items`, payload, {
        headers: { ...authHeaders(token) },
      });
      const now = Date.now();
      const api = res.data as Partial<Item> | undefined;
      const newItem: Item = {
        id: api?.id ?? now.toString(),
        name: api?.name ?? name.trim(),
        description: api?.description ?? (description.trim() || undefined),
        price: api?.price ?? parseFloat(price),
        category: api?.category ?? category,
        condition: (api?.condition as Condition | undefined) ?? condition,
        location: api?.location ?? location.trim(),
        whatsapp: api?.whatsapp ?? whatsapp.trim(),
        seller: seller.trim(),
        imageUri,
        createdAt: api?.createdAt,
        postedAt: new Date(now).toISOString(),
        isNew: true,
        _localPostedAt: now,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setItems(prev => [newItem, ...prev]);
      setName(''); setDesc(''); setPrice(''); setSeller('');
      setLocation(''); setWhatsapp(''); setImageUri('');
      setCategory('Otro'); setCondition('Bueno'); setErrors({});
      if (!IS_WEB) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setItems(prev => prev.map(i => i.id === newItem.id ? { ...i, isNew: false } : i));
      }, 700);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        Alert.alert(
          'Sesión no válida',
          'Tu sesión expiró o el token no es válido. Vuelve a iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();
                router.replace('/login');
              },
            },
          ],
        );
      } else if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { error?: string };
        Alert.alert('No se pudo publicar', d.error ?? 'Revisa los datos e intenta de nuevo.');
      } else {
        Alert.alert('Sin conexión', "El backend no respondió. ¿Está 'dotnet run' activo?");
      }
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = filterCat === 'Todas'
    ? items
    : items.filter(i => i.category === filterCat);

  const scrollToSection = (y: number) => {
    scrollRef.current?.scrollTo({ y: Math.max(0, y - theme.spacing.sm), animated: true });
  };

  const handleNavSelect = (key: MainNavKey) => {
    setActiveNav(key);
    if (key === 'publicar') {
      scrollToSection(publishY);
      return;
    }
    if (key === 'respaldos') {
      scrollToSection(respaldosY);
      return;
    }
    if (key === 'inicio') {
      scrollToSection(0);
      return;
    }
    if (key === 'cuenta') {
      scrollToSection(0);
      return;
    }
    if (key === 'ajustes') {
      scrollToSection(0);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y >= Math.max(0, publishY - 120)) {
              setActiveNav((prev) =>
                prev === 'publicar' || prev === 'respaldos' || prev === 'inicio' ? 'publicar' : prev,
              );
              return;
            }
            if (y >= Math.max(0, respaldosY - 140)) {
              setActiveNav((prev) =>
                prev === 'publicar' || prev === 'respaldos' || prev === 'inicio' ? 'respaldos' : prev,
              );
              return;
            }
            setActiveNav((prev) =>
              prev === 'publicar' || prev === 'respaldos' || prev === 'inicio' ? 'inicio' : prev,
            );
          }}
        >
          {/*
           * ─── CENTERED CONTAINER ───────────────────────────────────────────
           * On web/desktop this View caps width at MAX_W and centers itself.
           * On mobile it's just a transparent full-width wrapper.
           */}
          <View style={styles.centerWrap}>

            <MainTopNavbar
              guardianProfile={guardianProfile}
              trustLoading={trustLoading}
              treasureCount={items.length}
              circulationFormatted={fmt(items.reduce((s, i) => s + i.price, 0))}
              onSignOut={async () => {
                await signOut();
                router.replace('/login');
              }}
            />

            <PublishNavBar
              activeTab={activeNav}
              onSelect={handleNavSelect}
            />

            <View onLayout={(e) => setRespaldosY(e.nativeEvent.layout.y)}>
              <ReceivedBackingsSection />
            </View>

            <View
              style={styles.workspaceWrap}
              onLayout={(e) => setPublishY(e.nativeEvent.layout.y)}
            >
              {IS_WIDE ? (
                <PublishSidebar itemCount={items.length} profile={guardianProfile} />
              ) : null}

              <View style={styles.workspaceMain}>
                {/* ── Publish card ── */}
                <Animated.View
                  style={[styles.card, { transform: [{ translateX: shakeX }] }]}
                >
              <Text style={styles.cardTitle}>✨ Publicar un tesoro</Text>

              {/*
               * ImagePickerField is full-width inside the card but the card
               * itself is already capped. On desktop the image won't stretch.
               */}
              <ImagePickerField uri={imageUri} onPick={setImageUri} />

              {/*
               * formRow = always side-by-side (row) because the card is already
               * narrow on mobile (fits fine). On web it gets extra breathing room.
               */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <FloatingInput
                    label="Nombre del artículo" value={name}
                    onChangeText={setName} error={errors.name}
                  />
                </View>
                <View style={styles.formCol}>
                  <FloatingInput
                    label="Tu nombre" value={seller}
                    onChangeText={setSeller} error={errors.seller}
                  />
                </View>
              </View>

              <FloatingInput
                label="Descripción (opcional)" value={description}
                onChangeText={setDesc} multiline
                placeholder="Cuéntanos la historia de este artículo…"
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <FloatingInput
                    label="Precio" value={price} onChangeText={setPrice}
                    keyboardType="numeric" error={errors.price} prefix="$"
                  />
                </View>
                <View style={styles.formCol}>
                  <FloatingInput
                    label="📍 Colonia / Ciudad" value={location}
                    onChangeText={setLocation}
                    error={errors.location}
                  />
                </View>
              </View>

              <FloatingInput
                label="WhatsApp" value={whatsapp}
                onChangeText={setWhatsapp} keyboardType="phone-pad" prefix="📱"
                error={errors.whatsapp}
                placeholder="Número de contacto"
              />

              <ConditionPicker value={condition} onSelect={setCondition} />
              <CategorySelect  value={category}  onSelect={setCategory}  />

              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  publishing             && styles.btnLoading,
                  pressed && !publishing && styles.btnPressed,
                ]}
                onPress={saveItem}
                disabled={publishing}
              >
                {publishing ? (
                  <View style={styles.btnInner}>
                    <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                    <Text style={styles.btnText}>Publicando…</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>🌱 Publicar tesoro</Text>
                )}
              </Pressable>
                </Animated.View>

                {/* ── Filter chips ── */}
                <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {FILTER_ORDER.map(cat => (
                <Pressable
                  key={cat}
                  style={[styles.chip, filterCat === cat && styles.chipActive]}
                  onPress={() => setFilterCat(cat)}
                >
                  <Text style={[styles.chipText, filterCat === cat && styles.chipTextActive]}>
                    {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
                  </Text>
                </Pressable>
              ))}
                </ScrollView>

                {/* ── List header ── */}
                <View style={styles.listHeader}>
              <Text style={styles.subtitle}>Tesoros disponibles</Text>
              {!loading && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{filtered.length}</Text>
                </View>
              )}
                </View>

                {/* ── List / states ── */}
                {loading ? (
              <View style={{ gap: theme.spacing.sm }}>
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </View>
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              /*
               * On desktop we render a two-column grid for the product cards.
               * On mobile it stays single-column via FlatList.
               */
              IS_WIDE ? (
                <View style={styles.cardGrid}>
                  {filtered.map(item => (
                    <View key={item.id} style={styles.cardGridItem}>
                      <ItemCard item={item} />
                    </View>
                  ))}
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={i => i.id}
                  renderItem={({ item }) => <ItemCard item={item} />}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
                />
              )
            )}
              </View>
            </View>

            <Text style={styles.footer}>Hecho con 💚 para el planeta · Secondra 2026</Text>
          </View>
          {/* end centerWrap */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles (tokens: @/constants/ui, spec client.ui) ───────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvasMuted },
  scroll: {
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl + theme.spacing.sm : theme.spacing.xl,
    paddingBottom: theme.spacing.xl + theme.spacing.sm,
    alignItems: IS_WEB ? 'center' : undefined,
  },

  centerWrap: {
    width: '100%',
    maxWidth: IS_WEB ? MAX_W : undefined,
    alignSelf: IS_WEB ? 'center' : undefined,
    paddingHorizontal: theme.spacing.md,
  },

  workspaceWrap: {
    flexDirection: IS_WIDE ? 'row' : 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  workspaceMain: {
    flex: 1,
    width: '100%',
    minWidth: 0,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...shadows.card,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },

  formRow: { flexDirection: 'row', gap: theme.spacing.sm },
  formCol: { flex: 1 },

  imagePicker: {
    borderRadius: theme.radius,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    gap: theme.spacing.xs,
  },
  imagePlaceholderIcon: { fontSize: 32 },
  imagePlaceholderText: { fontSize: 14, color: theme.colors.muted, fontWeight: '500' },
  imagePreview: { width: '100%', height: 200 },

  fieldWrapper: { gap: theme.spacing.xs },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text, letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    ...shadows.cardSubtle,
  },
  inputWrapperMulti: { alignItems: 'flex-start', paddingVertical: theme.spacing.xs },
  inputWrapperFocused: { borderColor: theme.colors.primary, shadowOpacity: 0.08 },
  inputWrapperError: { borderColor: theme.colors.danger },
  inputPrefix: { fontSize: 16, fontWeight: '700', color: theme.colors.muted, marginRight: theme.spacing.unit },
  input: { flex: 1, height: 48, fontSize: 15, color: theme.colors.text },
  errorText: { fontSize: 12, color: theme.colors.danger, marginTop: 2 },

  conditionChip: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  conditionChipText: { fontSize: 13, color: theme.colors.muted },

  btn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.unit,
    ...shadows.button,
  },
  btnPressed: { backgroundColor: theme.colors.primaryDark, shadowOpacity: 0.15 },
  btnLoading: { backgroundColor: theme.colors.primaryDark, shadowOpacity: 0.1 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  btnText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  chipsScroll: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.unit,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.muted, fontWeight: '500' },
  chipTextActive: { color: theme.colors.primaryDark, fontWeight: '700' },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  subtitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  countText: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryDark },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  cardGridItem: { width: IS_WIDE ? (`calc(50% - ${theme.spacing.sm / 2}px)` as any) : '100%' },

  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    overflow: 'hidden',
    ...shadows.itemCard,
  },
  itemImage: { width: '100%', height: 160 },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.primaryDark },
  newBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.onPrimary,
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  itemDesc: {
    fontSize: 13,
    color: theme.colors.muted,
    lineHeight: 18,
    paddingHorizontal: theme.spacing.sm,
  },
  expandToggle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: 2,
  },
  locationText: { fontSize: 12, color: theme.colors.muted, paddingHorizontal: theme.spacing.sm },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: theme.colors.primaryDark },
  sellerName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  timeAgo: { fontSize: 11, color: theme.colors.muted },
  itemPrice: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  actionBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  actionBtnWA: { borderColor: theme.colors.whatsappAccent, backgroundColor: theme.colors.whatsappSoft },
  actionBtnText: { fontSize: 13, color: theme.colors.muted, fontWeight: '600' },
  actionBtnTextActive: { color: theme.colors.primaryDark },

  skeletonLine: { backgroundColor: theme.colors.skeleton, borderRadius: theme.radius },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginTop: theme.spacing.xs,
  },
  emptyIcon: { fontSize: 52, marginBottom: theme.spacing.sm },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptyText: { fontSize: 14, color: theme.colors.muted, textAlign: 'center', lineHeight: 20 },

  footer: { textAlign: 'center', color: theme.colors.muted, fontSize: 12, marginTop: theme.spacing.xl },
});
