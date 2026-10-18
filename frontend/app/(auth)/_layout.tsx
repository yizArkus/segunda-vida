import { Stack } from 'expo-router';
import { theme } from '@/constants/ui';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvasMuted },
        animation: 'fade',
      }}
    />
  );
}
