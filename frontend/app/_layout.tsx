import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { theme } from "@/constants/ui";

function AuthGuardStack() {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!navState?.key) return;

    const inAuth = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuth) {
      router.replace("/login");
      return;
    }
    if (isAuthenticated && inAuth) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, segments, navState?.key]);

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvasMuted },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGuardStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.canvasMuted,
  },
});
