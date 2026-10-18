import axios from 'axios';
import { authHeaders } from '@/lib/auth';
import type { GuardianBackingPublic, GuardianBackingReceived, UserPublic } from '@/types/guardian';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

function resolveToken(explicit?: string | null): string {
  const token = explicit?.trim();
  if (!token) throw new Error('Sin sesión');
  return token;
}

export async function fetchCurrentUserProfile(token?: string | null): Promise<UserPublic> {
  const resolved = resolveToken(token ?? undefined);
  const res = await axios.get<UserPublic>(`${API_URL}/users/me`, {
    headers: { ...authHeaders(resolved) },
    timeout: 65_000,
  });
  return res.data;
}

export async function createGuardianBacking(
  targetGuardianId: string,
  vouchText?: string | null,
  token?: string | null,
): Promise<GuardianBackingPublic> {
  const resolved = resolveToken(token ?? undefined);
  const res = await axios.post<GuardianBackingPublic>(
    `${API_URL}/guardians/${targetGuardianId}/backings`,
    vouchText ? { vouchText } : {},
    {
      headers: { ...authHeaders(resolved), 'Content-Type': 'application/json' },
      timeout: 65_000,
    },
  );
  return res.data;
}

export async function fetchReceivedBackings(token?: string | null): Promise<GuardianBackingReceived[]> {
  const resolved = resolveToken(token ?? undefined);
  const res = await axios.get<GuardianBackingReceived[]>(`${API_URL}/users/me/backings`, {
    headers: { ...authHeaders(resolved) },
    timeout: 65_000,
  });
  return res.data;
}
