const TOKEN_KEY = 'emerred_token';

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string };
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

function makeFakeJwt(email: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'admin-1', email, role: 'admin', exp: Date.now() + 3600_000 }));
  return `${header}.${payload}.mock-signature`;
}

// MOCK: reemplazar por POST /auth/login cuando el backend esté listo
export async function login(credentials: Credentials): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'admin@emerred.co' && credentials.password === 'admin123') {
        const token = makeFakeJwt(credentials.email);
        setCookie(TOKEN_KEY, token);
        resolve({
          token,
          user: { id: 'admin-1', email: credentials.email, name: 'Administrador' },
        });
      } else {
        reject(new Error('Credenciales inválidas'));
      }
    }, 600);
  });
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  // MOCK: en producción validar expiración o refrescar con el backend
  return true;
}
