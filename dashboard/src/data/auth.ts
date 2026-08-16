const API_BASE = import.meta.env.VITE_API_URL || 'https://emerred-production.up.railway.app';
const TOKEN_KEY = 'emerred_token';

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
}

export function getAuthToken(): string | null {
  return getCookie(TOKEN_KEY);
}

export function removeAuthToken() {
  deleteCookie(TOKEN_KEY);
}

export async function login(credentials: Credentials): Promise<AuthResult> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const json = await res.json().catch(() => ({ success: false, message: 'Respuesta no válida' }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Error de autenticación');
  }

  const { token, user } = json.data;
  setCookie(TOKEN_KEY, token);
  return { token, user };
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
