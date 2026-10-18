import axios, { isAxiosError } from 'axios';

/** Mensaje amigable para errores de API autenticada. */
export function formatAuthApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Tu sesión expiró o no es válida. Volvé a iniciar sesión.';
    }
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

export { axios, isAxiosError };
