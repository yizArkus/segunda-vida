import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { formatAuthApiError, isUnauthorizedError } from '@/lib/apiErrors';
import { createGuardianBacking, fetchCurrentUserProfile } from '@/services/guardianTrustApi';
import type { GuardianBackingPublic, UserPublic } from '@/types/guardian';

/**
 * Perfil de confianza del Guardián y acción de respaldo (Protocolo de Respaldo del Guardián).
 */
export function useGuardianTrust() {
  const { isAuthenticated, isLoading, accessToken, signOut } = useAuth();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isLoading || !isAuthenticated || !accessToken) {
      if (!isLoading && !isAuthenticated) {
        setProfile(null);
        setError(null);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentUserProfile(accessToken);
      setProfile(data);
    } catch (e) {
      if (isUnauthorizedError(e)) {
        await signOut();
        router.replace('/login');
        return;
      }
      setError(formatAuthApiError(e, 'No se pudo cargar tu perfil de confianza.'));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, accessToken, signOut]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const vouchGuardian = useCallback(
    async (targetGuardianId: string, vouchText?: string | null): Promise<GuardianBackingPublic> => {
      if (!accessToken) throw new Error('Sin sesión');
      const created = await createGuardianBacking(targetGuardianId, vouchText, accessToken);
      await refresh();
      return created;
    },
    [accessToken, refresh],
  );

  return {
    profile,
    loading,
    error,
    refresh,
    vouchGuardian,
  };
}
