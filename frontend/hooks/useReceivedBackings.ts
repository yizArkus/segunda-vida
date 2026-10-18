import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { formatAuthApiError, isUnauthorizedError } from '@/lib/apiErrors';
import { fetchReceivedBackings } from '@/services/guardianTrustApi';
import type { GuardianBackingReceived } from '@/types/guardian';

/**
 * Lista de respaldos recibidos por el Guardián autenticado (GET /users/me/backings).
 */
export function useReceivedBackings() {
  const { isAuthenticated, isLoading, accessToken, signOut } = useAuth();
  const [backings, setBackings] = useState<GuardianBackingReceived[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isLoading || !isAuthenticated || !accessToken) {
      if (!isLoading && !isAuthenticated) {
        setBackings([]);
        setError(null);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReceivedBackings(accessToken);
      setBackings(data);
    } catch (e) {
      if (isUnauthorizedError(e)) {
        await signOut();
        router.replace('/login');
        return;
      }
      setError(formatAuthApiError(e, 'No pudimos traer a quienes dan la cara por ti.'));
      setBackings([]);
    } finally {
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, accessToken, signOut]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { backings, loading, error, refresh };
}
