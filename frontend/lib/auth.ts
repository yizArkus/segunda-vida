import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'secondra_access_token';

export async function getAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
