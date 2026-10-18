import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, getAccessToken, setAccessToken as persistToken } from '../lib/auth';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const token = await getAccessToken();
    const trimmed = token?.trim() || null;
    setAccessTokenState(trimmed);
    setIsAuthenticated(!!trimmed);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        const trimmed = token?.trim() || null;
        if (alive) {
          setAccessTokenState(trimmed);
          setIsAuthenticated(!!trimmed);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    await persistToken(trimmed);
    setAccessTokenState(trimmed);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearAccessToken();
    setAccessTokenState(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      accessToken,
      signIn,
      signOut,
      refreshSession,
    }),
    [isLoading, isAuthenticated, accessToken, signIn, signOut, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
